"use client"

import { useState, useCallback } from "react"
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  type QueryConstraint,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { handleFirebaseError } from "@/lib/utils/errors"

interface FirestoreHookOptions {
  collectionName: string
}

interface FirestoreHookReturn<T> {
  data: T[]
  loading: boolean
  error: Error | null
  fetchAll: () => Promise<void>
  fetchOne: (id: string) => Promise<T | null>
  add: (data: Omit<T, "id">) => Promise<T>
  update: (id: string, data: Partial<T>) => Promise<void>
  remove: (id: string) => Promise<void>
  query: (constraints: QueryConstraint[]) => Promise<T[]>
}

export function useFirestore<T extends { id: string }>({
  collectionName,
}: FirestoreHookOptions): FirestoreHookReturn<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const querySnapshot = await getDocs(collection(db, collectionName))
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[]

      // Eliminar duplicados basados en el ID
      const uniqueItems = Array.from(new Set(items.map((item) => item.id)))
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is T => item !== undefined)

      setData(uniqueItems)
    } catch (err) {
      const error = handleFirebaseError(err)
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  const fetchOne = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        const docRef = doc(db, collectionName, id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as T
        }
        return null
      } catch (err) {
        const error = handleFirebaseError(err)
        setError(error)
        console.error("Error fetching document:", error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [collectionName],
  )

  const add = useCallback(
    async (data: Omit<T, "id">) => {
      setLoading(true)
      setError(null)
      try {
        const docRef = await addDoc(collection(db, collectionName), data)
        const newItem = { id: docRef.id, ...data } as T
        setData((prev) => [...prev, newItem])
        return newItem
      } catch (err) {
        const error = handleFirebaseError(err)
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [collectionName],
  )

  const update = useCallback(
    async (id: string, data: Partial<T>) => {
      setLoading(true)
      setError(null)
      try {
        const docRef = doc(db, collectionName, id)
        await updateDoc(docRef, data as any)
        setData((prev) => prev.map((item) => (item.id === id ? ({ ...item, ...data } as T) : item)))
      } catch (err) {
        const error = handleFirebaseError(err)
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [collectionName],
  )

  const remove = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        await deleteDoc(doc(db, collectionName, id))
        setData((prev) => prev.filter((item) => item.id !== id))
      } catch (err) {
        const error = handleFirebaseError(err)
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [collectionName],
  )

  const queryData = useCallback(
    async (constraints: QueryConstraint[]) => {
      setLoading(true)
      setError(null)
      try {
        const q = query(collection(db, collectionName), ...constraints)
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[]
      } catch (err) {
        const error = handleFirebaseError(err)
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [collectionName],
  )

  return {
    data,
    loading,
    error,
    fetchAll,
    fetchOne,
    add,
    update,
    remove,
    query: queryData,
  }
}

