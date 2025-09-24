"use client"

import { useState, useEffect } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getAuthToken } from "@/lib/auth"

export interface AuthState {
  user: User | null
  loading: boolean
  token: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    token: null,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await getAuthToken()
        setAuthState({ user, loading: false, token })
      } else {
        setAuthState({ user: null, loading: false, token: null })
      }
    })

    return unsubscribe
  }, [])

  return authState
}
