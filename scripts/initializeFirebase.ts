"use server"

import { auth, db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"

export async function createInitialAdminUser() {
  try {
    // Crear usuario admin en Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, "admin@gftire.com", "admin123456")

    // Crear documento de usuario en Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: "admin@gftire.com",
      role: "admin",
      name: "Administrador",
      createdAt: new Date().toISOString(),
    })

    return { success: true, message: "Usuario administrador creado exitosamente" }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Error al crear usuario administrador",
    }
  }
}

