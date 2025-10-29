import React from 'react'

type Ctx = { theme: 'light' | 'dark'; toggle: () => void; set: (t: 'light'|'dark') => void }
const ThemeCtx = React.createContext<Ctx | null>(null)

const STORAGE_KEY = 'mts_theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as 'light'|'dark'|null
    if (saved) return saved
    // preferências do sistema
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })

  React.useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const ctx: Ctx = {
    theme,
    toggle: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')),
    set: setTheme,
  }

  return <ThemeCtx.Provider value={ctx}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}
