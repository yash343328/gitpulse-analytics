// src/pages/Settings.jsx
import { useApp } from '../lib/AppContext'
import { historyStore, favoritesStore } from '../lib/store'
import { Icon } from '../components/UI'

export default function Settings() {
  const { settings, updateSettings, toggleTheme, pushToast } = useApp()

  function resetData() {
    historyStore.clear()
    localStorage.removeItem('gp_favorites')
    pushToast('Local data cleared.', 'success')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Settings</h1>
      <p className="opacity-60 text-sm mb-8">Preferences are saved locally in your browser — nothing is sent to a server.</p>

      <div className="glass-card p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Appearance</p>
            <p className="text-xs opacity-50">Switch between dark and light mode, or press “d” anywhere.</p>
          </div>
          <button onClick={toggleTheme} className="btn-ghost">
            <Icon name={settings.theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" />
            {settings.theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </div>

      <div className="glass-card p-5 mb-4">
        <p className="font-medium mb-1">Default repository sort</p>
        <p className="text-xs opacity-50 mb-3">Used as the default ordering on a profile's Repositories tab.</p>
        <select
          value={settings.defaultSort}
          onChange={(e) => updateSettings({ defaultSort: e.target.value })}
          className="glass-card px-3 py-2 text-sm bg-transparent outline-none w-full sm:w-60"
        >
          <option value="stars">Most stars</option>
          <option value="forks">Most forks</option>
          <option value="updated">Recently updated</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      <div className="glass-card p-5 mb-4">
        <p className="font-medium mb-1">Repositories per page</p>
        <p className="text-xs opacity-50 mb-3">How many repository cards load before “Load more”.</p>
        <input
          type="range" min="6" max="24" step="3"
          value={settings.perPage}
          onChange={(e) => updateSettings({ perPage: Number(e.target.value) })}
          className="w-full accent-pulse-violet"
        />
        <p className="text-xs opacity-60 mt-1">{settings.perPage} repositories</p>
      </div>

      <div className="glass-card p-5 mb-4 flex items-center justify-between">
        <div>
          <p className="font-medium">Reduce motion</p>
          <p className="text-xs opacity-50">Minimizes animations across the app.</p>
        </div>
        <input
          type="checkbox"
          checked={settings.reduceMotion}
          onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
          className="w-5 h-5 accent-pulse-violet"
        />
      </div>

      <div className="glass-card p-5 flex items-center justify-between">
        <div>
          <p className="font-medium">Clear local data</p>
          <p className="text-xs opacity-50">Removes saved favorites and search history from this browser.</p>
        </div>
        <button onClick={resetData} className="btn-ghost text-pulse-rose border-pulse-rose/30">Clear data</button>
      </div>
    </div>
  )
}
