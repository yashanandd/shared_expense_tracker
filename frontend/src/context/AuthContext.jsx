import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authService } from '../services/service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!localStorage.getItem('auth_token'))

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await authService.getProfile()
      setUser(res.data)
    } catch (err) {
      console.error('Failed to restore session:', err)
      localStorage.removeItem('auth_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password })
    localStorage.setItem('auth_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // proceed with local logout even if server fails
    }
    localStorage.removeItem('auth_token')
    setUser(null)
  }, [])

  const register = useCallback(async (data) => {
    const res = await authService.register(data)
    localStorage.setItem('auth_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

