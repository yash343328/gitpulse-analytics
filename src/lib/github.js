// src/lib/github.js
// Thin GitHub REST API client with in-memory + localStorage caching
// and graceful rate-limit handling.

const API = 'https://api.github.com'
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN || ''
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const memCache = new Map()

function cacheGet(key) {
  const hit = memCache.get(key)
  if (hit && Date.now() - hit.t < CACHE_TTL) return hit.v
  try {
    const raw = localStorage.getItem('gp_cache_' + key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Date.now() - parsed.t < CACHE_TTL) return parsed.v
    }
  } catch (_) {}
  return null
}

function cacheSet(key, v) {
  const entry = { t: Date.now(), v }
  memCache.set(key, entry)
  try { localStorage.setItem('gp_cache_' + key, JSON.stringify(entry)) } catch (_) {}
}

export class GitHubError extends Error {
  constructor(message, status, rateLimited = false) {
    super(message)
    this.status = status
    this.rateLimited = rateLimited
  }
}

async function request(path, { paginate = false, params = {} } = {}) {
  const qs = new URLSearchParams(params).toString()
  const key = path + (qs ? '?' + qs : '')
  const cached = cacheGet(key)
  if (cached) return cached

  const headers = { Accept: 'application/vnd.github+json' }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`

  const res = await fetch(`${API}${path}${qs ? '?' + qs : ''}`, { headers })

  const remaining = res.headers.get('x-ratelimit-remaining')
  const resetAt = res.headers.get('x-ratelimit-reset')

  if (res.status === 403 && remaining === '0') {
    const resetDate = resetAt ? new Date(parseInt(resetAt, 10) * 1000) : null
    throw new GitHubError(
      resetDate
        ? `GitHub API rate limit reached. Try again after ${resetDate.toLocaleTimeString()}.`
        : 'GitHub API rate limit reached. Please try again shortly.',
      403,
      true
    )
  }
  if (res.status === 404) throw new GitHubError('Not found on GitHub.', 404)
  if (!res.ok) throw new GitHubError(`GitHub API error (${res.status})`, res.status)

  const data = await res.json()
  cacheSet(key, data)
  return data
}

async function requestAll(path, params = {}, maxPages = 5) {
  let page = 1
  let out = []
  while (page <= maxPages) {
    const data = await request(path, { params: { ...params, per_page: 100, page } })
    if (!Array.isArray(data) || data.length === 0) break
    out = out.concat(data)
    if (data.length < 100) break
    page++
  }
  return out
}

export const gh = {
  user: (username) => request(`/users/${username}`),
  orgs: (username) => request(`/users/${username}/orgs`),
  repos: (username) => requestAll(`/users/${username}/repos`, { sort: 'updated' }),
  orgRepos: (org) => requestAll(`/orgs/${org}/repos`, { sort: 'updated' }),
  followers: (username) => requestAll(`/users/${username}/followers`, {}, 2),
  following: (username) => requestAll(`/users/${username}/following`, {}, 2),
  repoLanguages: (owner, repo) => request(`/repos/${owner}/${repo}/languages`),
  repoCommits: (owner, repo, params = {}) => request(`/repos/${owner}/${repo}/commits`, { params: { per_page: 30, ...params } }),
  repoReleases: (owner, repo) => request(`/repos/${owner}/${repo}/releases`, { params: { per_page: 10 } }),
  repoPulls: (owner, repo, state = 'all') => request(`/repos/${owner}/${repo}/pulls`, { params: { state, per_page: 30 } }),
  repoIssues: (owner, repo, state = 'all') => request(`/repos/${owner}/${repo}/issues`, { params: { state, per_page: 30 } }),
  repoContributors: (owner, repo) => request(`/repos/${owner}/${repo}/contributors`, { params: { per_page: 10 } }),
  searchUsers: (q) => request('/search/users', { params: { q, per_page: 6 } }),
  rateLimit: () => request('/rate_limit')
}

// Aggregate language usage in bytes across a list of repos
export async function aggregateLanguages(owner, repos) {
  const top = repos.slice(0, 20)
  const results = await Promise.allSettled(top.map((r) => gh.repoLanguages(owner, r.name)))
  const totals = {}
  results.forEach((res) => {
    if (res.status === 'fulfilled') {
      Object.entries(res.value).forEach(([lang, bytes]) => {
        totals[lang] = (totals[lang] || 0) + bytes
      })
    }
  })
  return totals
}

// Compute a 0-100 "developer score" from profile + repo signals
export function computeScore({ user, repos, followers }) {
  if (!user) return 0
  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0)
  const forks = repos.reduce((s, r) => s + r.forks_count, 0)
  const repoCount = repos.length
  const accountAgeYears = (Date.now() - new Date(user.created_at).getTime()) / (365 * 24 * 3600 * 1000)

  const starScore = Math.min(30, Math.log10(stars + 1) * 10)
  const forkScore = Math.min(15, Math.log10(forks + 1) * 7)
  const repoScore = Math.min(20, Math.log10(repoCount + 1) * 12)
  const followerScore = Math.min(20, Math.log10((followers || 0) + 1) * 8)
  const ageScore = Math.min(15, accountAgeYears * 1.5)

  return Math.round(Math.min(100, starScore + forkScore + repoScore + followerScore + ageScore))
}

// Compute a 0-100 health score for a single repo
export function repoHealthScore(repo) {
  let score = 40
  if (repo.description) score += 8
  if (repo.license) score += 10
  if (!repo.archived) score += 10
  if (repo.has_issues) score += 6
  const updatedDays = (Date.now() - new Date(repo.pushed_at).getTime()) / (24 * 3600 * 1000)
  if (updatedDays < 30) score += 16
  else if (updatedDays < 180) score += 10
  else if (updatedDays < 365) score += 4
  score += Math.min(10, Math.log10(repo.stargazers_count + 1) * 4)
  return Math.round(Math.min(100, score))
}
