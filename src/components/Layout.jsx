// src/components/Layout.jsx
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../lib/AppContext'
import { Icon, ToastStack } from './UI'
import { gh } from '../lib/github'
import { historyStore } from '../lib/store'

function SearchBar() {
  const { searchRef } = useApp()
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const boxRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    function onClick(e) { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (!q.trim()) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await gh.searchUsers(q.trim())
        setSuggestions(res.items || [])
      } catch (_) { setSuggestions([]) }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [q])

  function go(username) {
    if (!username.trim()) return
    historyStore.add(username.trim())
    navigate(`/profile/${username.trim()}`)
    setOpen(false)
    setQ('')
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <div className="glass-card flex items-center gap-2 px-3.5 py-2.5">
        <Icon name="search" className="w-4 h-4 opacity-50 shrink-0" />
        <input
          ref={searchRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onKeyDown={(e) => e.key === 'Enter' && go(q)}
          placeholder="Search any GitHub username…"
          className="bg-transparent outline-none w-full text-sm placeholder:opacity-50"
          aria-label="Search GitHub username"
        />
        <kbd className="hidden sm:inline-block chip !py-0.5 text-[10px] font-mono opacity-60">/</kbd>
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute mt-2 w-full glass-card overflow-hidden z-50 animate-fade-up">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => go(s.login)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-pulse-violet/10 text-left transition-colors"
            >
              <img src={s.avatar_url} alt="" className="w-7 h-7 rounded-full" />
              <span className="text-sm">{s.login}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Layout({ children }) {
  const { settings, toggleTheme } = useApp()
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/compare', label: 'Compare' },
    { to: '/favorites', label: 'Favorites' },
    { to: '/settings', label: 'Settings' },
    { to: '/about', label: 'About' }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-ink-950 relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 bg-aurora opacity-70 dark:opacity-100" />
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-ink-950/70 border-b border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg shrink-0">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-pulse-violet to-pulse-cyan flex items-center justify-center text-white">
              <Icon name="bolt" className="w-4 h-4" />
            </span>
            <span className="gradient-text">GitPulse</span>
          </Link>
          <div className="hidden md:flex flex-1 justify-center"><SearchBar /></div>
          <nav className="hidden lg:flex items-center gap-1 ml-auto">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === l.to ? 'text-pulse-violet bg-pulse-violet/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button onClick={toggleTheme} className="btn-ghost p-2 ml-auto lg:ml-0" aria-label="Toggle theme">
            <Icon name={settings.theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" />
          </button>
          <button onClick={() => setNavOpen((v) => !v)} className="btn-ghost p-2 lg:hidden" aria-label="Menu">
            <Icon name={navOpen ? 'close' : 'grid'} className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 pb-3 md:hidden"><SearchBar /></div>
        {navOpen && (
          <nav className="lg:hidden flex flex-col px-4 pb-4 gap-1 animate-fade-up">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setNavOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5">
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1 relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-black/5 dark:border-white/5 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2">
            <div className="flex items-center gap-2 font-display font-bold text-lg mb-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-pulse-violet to-pulse-cyan flex items-center justify-center text-white">
                <Icon name="bolt" className="w-3.5 h-3.5" />
              </span>
              <span className="gradient-text">GitPulse</span>
            </div>
            <p className="opacity-60 max-w-xs">Premium analytics for any GitHub profile — commits, languages, growth, and health, beautifully visualized.</p>
          </div>
          <div>
            <p className="font-semibold mb-2 opacity-80">Product</p>
            <div className="flex flex-col gap-1.5 opacity-60">
              <Link to="/compare" className="hover:text-pulse-violet">Compare profiles</Link>
              <Link to="/favorites" className="hover:text-pulse-violet">Favorites</Link>
              <Link to="/settings" className="hover:text-pulse-violet">Settings</Link>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-2 opacity-80">Company</p>
            <div className="flex flex-col gap-1.5 opacity-60">
              <Link to="/about" className="hover:text-pulse-violet">About</Link>
              <Link to="/contact" className="hover:text-pulse-violet">Contact</Link>
              <Link to="/privacy" className="hover:text-pulse-violet">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-pulse-violet">Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-black/5 dark:border-white/5 py-5 text-center text-sm">
          <span className="opacity-70">© {new Date().getFullYear()} GitPulse · </span>
          <span className="font-medium gradient-text">Developed by Yash Jain</span>
        </div>
      </footer>
      <ToastStack />
    </div>
  )
}
