import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'uz'
  })

  useEffect(() => {
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.body.style.backgroundColor = '#0f172a'
      document.body.style.color = '#ffffff'
    } else {
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = '#f1f5f9'
      document.body.style.color = '#1e293b'
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const toggleTheme = () => setIsDark(!isDark)
  const theme = isDark ? 'dark' : 'light'

  return (
    <ThemeContext.Provider value={{
      isDark,
      theme,
      toggleTheme,
      language,
      setLanguage
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
