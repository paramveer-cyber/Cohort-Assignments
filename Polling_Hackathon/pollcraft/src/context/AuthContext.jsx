import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, tokenStore } from '../api/index.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        const refreshed = await authApi.refresh()
        if (!refreshed || cancelled) {
          setLoading(false)
          return
        }
        const { user: me } = await authApi.me()
        if (!cancelled && me) {
          setUser(me)
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const handler = () => {
      setUser(null)
      tokenStore.clear()
    }
    window.addEventListener('auth:expired', handler)
    return () => window.removeEventListener('auth:expired', handler)
  }, [])

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await authApi.login({ email, password })
    tokenStore.set(token)
    setUser(u)
  }, [])

  const register = useCallback(async (name, email, password) => {
    const { token, user: u } = await authApi.register({ name, email, password })
    tokenStore.set(token)
    setUser(u)
  }, [])

  const googleAuth = useCallback(async (idToken) => {
    const { token, user: u } = await authApi.google(idToken)
    tokenStore.set(token)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch {}
    tokenStore.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleAuth, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
