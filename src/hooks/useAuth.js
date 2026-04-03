import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function login() {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Erro ao fazer login:', error)
    }
  }

  async function logout() {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  }

  return { user, loading, login, logout }
}
