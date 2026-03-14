import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initAuth()
  }, [])

  const initAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await authAPI.me()
        setUser(response.data)
      }
    } catch (error) {
      console.error('Auth error:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const loginWithCode = async (code) => {
    const cleanCode = code.replace('-', '').replace(' ', '')
    const response = await authAPI.loginWithCode(cleanCode)
    const { token, user: userData } = response.data
    localStorage.setItem('token', token)
    setUser(userData)
    return userData
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, updateUser, logout, loginWithCode, initAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
