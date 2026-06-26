// src/pages/Home.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/UI'
import { historyStore, favoritesStore } from '../lib/store'
import { useApp } from '../lib/AppContext'

const FEATURES = [
  { icon: 'trend', title: 'Growth trends', desc: 'Stars, forks and repo creation plotted over time.' },
  { icon: 'grid', title: 'Language breakdown', desc: 'Byte-weighted language usage across every repo.' },
  { icon: 'bolt', title: 'Dev & repo scores', desc: 'A single number that captures profile strength and repo health.' },
  { icon: 'download', title: 'Export anywhere', desc: 'One-click PDF reports, CSV and JSON exports.' }
]

export default function Home() {
  const [q, setQ] = useState('')
  const [history, setHistory] = useState([])
  const [favorites, setFavorites] = useState([])
  const navigate = useNavigate()
  const { pushToast } = useApp()

  useEffect(() => {
    setHistory(historyStore.list())
    setFavorites(favoritesStore.list())
  }, [])

  function go(username) {
    const name = username.trim()
    if (!name) { pushToast('Enter a GitHub username first.', 'error'); return }
    historyStore.add(name)
    navigate(`/profile/${name}`)
  }

  return (
    <div>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
        <span className="chip mb-5 inline-flex animate-fade-up">⚡ Real-time GitHub intelligence</span>
        <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[1.1] animate-fade-up" style={{ animationDelay: '60ms' }}>
          Turn any GitHub profile into a
          <span className="gradient-text"> living dashboard</span>
        </h1>
        <p className="mt-5 text-base sm:text-lg opacity-60 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '120ms' }}>
          GitPulse pulls commits, languages, releases, pull requests and more straight from the GitHub API
          and renders them as a premium, exportable analytics report — in seconds.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); go(q) }} className="mt-9 max-w-lg mx-auto flex gap-2 animate-fade-up" style={{ animationDelay: '180ms' }}>
          <div className="glass-card flex-1 flex items-center gap-2 px-4 py-3">
            <Icon name="user" className="w-4 h-4 opacity-50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. torvalds, gaearon, sindresorhus…"
              className="bg-transparent outline-none w-full text-sm"
              aria-label="GitHub username"
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary px-6">
            Analyze <Icon name="bolt" className="w-4 h-4" />
          </button>
        </form>

        {history.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 justify-center animate-fade-up" style={{ animationDelay: '240ms' }}>
            <span className="text-xs opacity-50 flex items-center gap-1"><Icon name="clock" className="w-3.5 h-3.5" />Recent:</span>
            {history.slice(0, 6).map((u) => (
              <button key={u} onClick={() => go(u)} className="chip hover:border-pulse-violet/40 hover:text-pulse-violet transition-colors">{u}</button>
            ))}
          </div>
        )}
      </section>

      {favorites.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
          <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2"><Icon name="heart" className="w-4 h-4 text-pulse-rose" /> Favorites</h2>
          <div className="flex flex-wrap gap-2">
            {favorites.map((u) => (
              <button key={u} onClick={() => go(u)} className="chip hover:border-pulse-violet/40 hover:text-pulse-violet transition-colors">{u}</button>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f, i) => (
          <div key={f.title} className="glass-card p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pulse-violet/20 to-pulse-cyan/20 flex items-center justify-center mb-4">
              <Icon name={f.icon} className="w-5 h-5 text-pulse-violet" />
            </div>
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm opacity-60">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
