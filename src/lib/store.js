// src/lib/store.js
// Tiny localStorage-backed persistence helpers (no backend required).

const KEYS = {
  history: 'gp_history',
  favorites: 'gp_favorites',
  settings: 'gp_settings'
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (_) {
    return fallback
  }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch (_) {}
}

export const historyStore = {
  list: () => read(KEYS.history, []),
  add: (username) => {
    const list = read(KEYS.history, []).filter((u) => u.toLowerCase() !== username.toLowerCase())
    list.unshift(username)
    write(KEYS.history, list.slice(0, 12))
    return list
  },
  clear: () => write(KEYS.history, [])
}

export const favoritesStore = {
  list: () => read(KEYS.favorites, []),
  has: (username) => read(KEYS.favorites, []).some((u) => u.toLowerCase() === username.toLowerCase()),
  toggle: (username) => {
    const list = read(KEYS.favorites, [])
    const exists = list.some((u) => u.toLowerCase() === username.toLowerCase())
    const next = exists ? list.filter((u) => u.toLowerCase() !== username.toLowerCase()) : [username, ...list]
    write(KEYS.favorites, next)
    return next
  }
}

export const settingsStore = {
  get: () => read(KEYS.settings, { theme: 'dark', defaultSort: 'updated', perPage: 12, reduceMotion: false }),
  set: (patch) => {
    const next = { ...settingsStore.get(), ...patch }
    write(KEYS.settings, next)
    return next
  }
}
