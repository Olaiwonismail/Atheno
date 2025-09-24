import { auth } from "./firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"

export interface AuthUser {
  uid: string
  email: string | null
  role: "teacher" | "student"
}

export const signUp = async (email: string, password: string, name: string, role: "teacher" | "student") => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Register user with backend
    const token = await user.getIdToken()
    const response = await fetch("https://atheno.onrender.com/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: user.email,
        name: name,
        role: role,
        firebase_uid: user.uid,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to register with backend")
    }

    return { user, token }
  } catch (error) {
    console.error("Sign up error:", error)
    throw error
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    const token = await user.getIdToken()

    // Get user data from backend
    const response = await fetch("https://atheno.onrender.com/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get user data from backend")
    }

    const userData = await response.json()
    return { user, token, userData }
  } catch (error) {
    console.error("Sign in error:", error)
    throw error
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error("Sign out error:", error)
    throw error
  }
}

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

export const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser
  if (user) {
    return await user.getIdToken()
  }
  return null
}
