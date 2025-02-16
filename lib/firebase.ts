import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

let app
let auth
let db
let storage

try {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: "gftire-shop.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  // Verificar configuración
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    throw new Error("Firebase configuration is incomplete. Check your environment variables.")
  }

  // Initialize Firebase
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)

  console.log("Firebase initialized successfully")
} catch (error) {
  console.error("Error initializing Firebase:", error)
  // No lanzar el error, solo registrarlo
}

export { app, auth, db, storage }

