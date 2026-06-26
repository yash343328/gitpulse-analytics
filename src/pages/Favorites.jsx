// src/pages/Favorites.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { favoritesStore, historyStore } from '../lib/store'
import { EmptyState, Icon } from '../components/UI'
import { useApp } from '../lib/AppContext'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [history, setHistory] = useState([])
  const { pushToast } = useApp()

  useEffect(() => {
    setFavorites(favoritesStore.list())
    setHistory(historyStore.list())
  }, [])

  function remove(u) {
    favoritesStore.toggle(u)
    setFavorites(favoritesStore.list())
    pushToast(`Removed @${u} from favorites.`, 'info')
  }

  function clearHistory() {
    historyStore.clear()
    setHistory([])
    pushToast('Search history cleared.', 'info')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Favorites & history</h1>
      <p className="opacity-60 text-sm mb-8">Profiles you've starred and the most recent searches, stored locally in your browser.</p>

      <h2 className="font-semibold mb-3 flex items-center gap-2"><Icon name="heart" className="w-4 h-4 text-pulse-rose" /> Favorites ({favorites.length})</h2>
      {favorites.length === 0 ? (
        <EmptyState icon="heart" title="No favorites yet" subtitle="Open a profile and tap “Add to favorites” to save it here." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          {favorites.map((u) => (
            <div key={u} className="glass-card p-4 flex items-center justify-between">
              <Link to={`/profile/${u}`} className="font-medium hover:text-pulse-violet">@{u}</Link>
              <button onClick={() => remove(u)} className="opacity-50 hover:opacity-100"><Icon name="close" className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-3 mt-10">
        <h2 className="font-semibold flex items-center gap-2"><Icon name="clock" className="w-4 h-4" /> Recently viewed</h2>
        {history.length > 0 && <button onClick={clearHistory} className="text-xs opacity-50 hover:opacity-100">Clear history</button>}
      </div>
      {history.length === 0 ? (
        <EmptyState icon="clock" title="No recent searches" subtitle="Profiles you analyze will show up here for quick access." />
      ) : (
        <div className="flex flex-wrap gap-2">
          {history.map((u) => <Link key={u} to={`/profile/${u}`} className="chip hover:border-pulse-violet/40 hover:text-pulse-violet">@{u}</Link>)}
        </div>
      )}
    </div>
  )
}
