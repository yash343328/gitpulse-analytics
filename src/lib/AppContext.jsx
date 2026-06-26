// src/lib/AppContext.jsx
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { settingsStore } from './store'

const AppCtx = createContext(null)

let toastId = 0

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(settingsStore.get())
  const [toasts, setToasts] = useState([])
  const searchRef = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [settings.theme])

  const toggleTheme = useCallback(() => {
    setSettings((s) => settingsStore.set({ theme: s.theme === 'dark' ? 'light' : 'dark' }))
  }, [])

  const updateSettings = useCallback((patch) => setSettings(settingsStore.set(patch)), [])

  const pushToast = useCallback((message, type = 'info') => {
    const id = ++toastId
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  useEffect(() => {
    function onKey(e) {
      const tag = (e.target?.tagName || '').toLowerCase()
      const typing = tag === 'input' || tag === 'textarea'
      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'd' && !typing && !e.metaKey && !e.ctrlKey) toggleTheme()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleTheme])

  return (
    <AppCtx.Provider value={{ settings, updateSettings, toggleTheme, pushToast, dismissToast, toasts, searchRef }}>
      {children}
    </AppCtx.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
