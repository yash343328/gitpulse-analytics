// src/pages/Profile.jsx
import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProfileData } from '../lib/useProfileData'
import { CardSkeleton, EmptyState, Icon, StatPill } from '../components/UI'
import { LanguagePie, RepoBarChart, GrowthLineChart, ActivityHeatmap, ScoreRing } from '../components/Charts'
import { repoHealthScore, computeScore } from '../lib/github'
import { exportCSV, exportJSON, exportPDFReport, copyToClipboard } from '../lib/exporters'
import { favoritesStore } from '../lib/store'
import { useApp } from '../lib/AppContext'

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'repos', label: 'Repositories', icon: 'fork' },
  { id: 'activity', label: 'Activity', icon: 'trend' },
  { id: 'orgs', label: 'Organizations', icon: 'org' }
]

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k'
  return String(n)
}

export default function Profile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { pushToast } = useApp()
  const { loading, error, data } = useProfileData(username)
  const [tab, setTab] = useState('overview')
  const [sort, setSort] = useState('stars')
  const [langFilter, setLangFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(9)
  const [isFav, setIsFav] = useState(() => favoritesStore.has(username))

  const langData = useMemo(() => {
    if (!data) return []
    const entries = Object.entries(data.languages)
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1
    return entries
      .map(([name, value]) => ({ name, value: (value / total) * 100 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [data])

  const growthData = useMemo(() => {
    if (!data) return []
    const byYear = {}
    data.repos.forEach((r) => {
      const y = new Date(r.created_at).getFullYear()
      byYear[y] = byYear[y] || { repos: 0, stars: 0 }
      byYear[y].repos += 1
      byYear[y].stars += r.stargazers_count
    })
    return Object.entries(byYear).sort(([a], [b]) => a - b).map(([year, v]) => ({ label: year, ...v }))
  }, [data])

  const filteredRepos = useMemo(() => {
    if (!data) return []
    let list = [...data.repos]
    if (langFilter !== 'all') list = list.filter((r) => r.language === langFilter)
    const sorters = {
      stars: (a, b) => b.stargazers_count - a.stargazers_count,
      forks: (a, b) => b.forks_count - a.forks_count,
      updated: (a, b) => new Date(b.pushed_at) - new Date(a.pushed_at),
      name: (a, b) => a.name.localeCompare(b.name)
    }
    return list.sort(sorters[sort])
  }, [data, sort, langFilter])

  const languageOptions = useMemo(() => {
    if (!data) return []
    return [...new Set(data.repos.map((r) => r.language).filter(Boolean))].sort()
  }, [data])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon="search"
        title={error.status === 404 ? `No GitHub user named "${username}"` : 'Something went wrong'}
        subtitle={error.message}
        action={<button onClick={() => navigate('/')} className="btn-primary mt-5">Back to search</button>}
      />
    )
  }

  const { user, repos, followers, following, topRepos, commitDates, pulls, issues, releases, orgs } = data
  const score = computeScore({ user, repos, followers: followers.length })
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0)
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0)
  const openPRs = pulls.filter((p) => p.state === 'open').length
  const openIssues = issues.filter((i) => i.state === 'open').length

  async function handleShare() {
    const url = `${window.location.origin}/profile/${username}`
    const ok = await copyToClipboard(url)
    pushToast(ok ? 'Profile link copied to clipboard.' : 'Could not copy link.', ok ? 'success' : 'error')
  }

  function toggleFav() {
    favoritesStore.toggle(username)
    setIsFav(favoritesStore.has(username))
    pushToast(isFav ? 'Removed from favorites.' : 'Added to favorites.', 'success')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile header */}
      <div className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start animate-fade-up">
        <img src={user.avatar_url} alt={user.login} className="w-24 h-24 rounded-2xl shadow-glow shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{user.name || user.login}</h1>
            <span className="chip">@{user.login}</span>
            {user.hireable && <span className="chip text-pulse-cyan">Hireable</span>}
          </div>
          {user.bio && <p className="opacity-70 mt-2 max-w-2xl text-sm">{user.bio}</p>}
          <div className="flex flex-wrap gap-2 mt-4">
            <StatPill icon="user" label="followers" value={fmt(user.followers)} />
            <StatPill icon="user" label="following" value={fmt(user.following)} />
            <StatPill icon="fork" label="repos" value={fmt(user.public_repos)} />
            <StatPill icon="star" label="stars" value={fmt(totalStars)} />
            <StatPill icon="fork" label="forks" value={fmt(totalForks)} />
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            <a href={user.html_url} target="_blank" rel="noreferrer" className="btn-ghost text-sm"><Icon name="link" className="w-4 h-4" />View on GitHub</a>
            <button onClick={toggleFav} className="btn-ghost text-sm">
              <Icon name="heart" className={`w-4 h-4 ${isFav ? 'text-pulse-rose' : ''}`} />{isFav ? 'Favorited' : 'Add to favorites'}
            </button>
            <button onClick={handleShare} className="btn-ghost text-sm"><Icon name="share" className="w-4 h-4" />Share</button>
            <button onClick={() => exportPDFReport({ user, repos, score })} className="btn-ghost text-sm"><Icon name="download" className="w-4 h-4" />PDF</button>
            <button onClick={() => exportCSV(`gitpulse-${username}-repos`, repos.map((r) => ({ name: r.name, stars: r.stargazers_count, forks: r.forks_count, language: r.language, updated: r.pushed_at })))} className="btn-ghost text-sm"><Icon name="csv" className="w-4 h-4" />CSV</button>
            <button onClick={() => exportJSON(`gitpulse-${username}`, { user, repos })} className="btn-ghost text-sm"><Icon name="download" className="w-4 h-4" />JSON</button>
          </div>
        </div>
        <ScoreRing score={score} label="Dev score" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mt-8 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-gradient-to-r from-pulse-violet to-pulse-blue text-white shadow-glow' : 'btn-ghost'}`}
          >
            <Icon name={t.icon} className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-5 mt-6">
          <div className="glass-card p-5 lg:col-span-2">
            <h3 className="font-semibold mb-3">Stars & repos created by year</h3>
            <GrowthLineChart data={growthData} lines={[{ key: 'repos', name: 'Repos created' }, { key: 'stars', name: 'Stars earned' }]} />
          </div>
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3">Language usage</h3>
            <LanguagePie data={langData} />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {langData.slice(0, 6).map((l) => <span key={l.name} className="chip">{l.name} · {l.value.toFixed(0)}%</span>)}
            </div>
          </div>
          <div className="glass-card p-5 lg:col-span-2">
            <h3 className="font-semibold mb-3">Top repositories by stars</h3>
            <RepoBarChart data={topRepos.map((r) => ({ name: r.name, stars: r.stargazers_count }))} dataKey="stars" />
          </div>
          <div className="glass-card p-5 flex flex-col gap-4">
            <h3 className="font-semibold">Snapshot</h3>
            <div className="flex justify-between text-sm"><span className="opacity-60">Open pull requests</span><span className="font-mono">{openPRs}</span></div>
            <div className="flex justify-between text-sm"><span className="opacity-60">Open issues</span><span className="font-mono">{openIssues}</span></div>
            <div className="flex justify-between text-sm"><span className="opacity-60">Recent releases</span><span className="font-mono">{releases.length}</span></div>
            <div className="flex justify-between text-sm"><span className="opacity-60">Organizations</span><span className="font-mono">{orgs.length}</span></div>
            <div className="flex justify-between text-sm"><span className="opacity-60">Account age</span><span className="font-mono">{new Date(user.created_at).getFullYear()}</span></div>
          </div>
        </div>
      )}

      {tab === 'repos' && (
        <div className="mt-6">
          <div className="flex flex-wrap gap-3 mb-5 items-center">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="glass-card px-3 py-2 text-sm bg-transparent outline-none">
              <option value="stars">Sort: Most stars</option>
              <option value="forks">Sort: Most forks</option>
              <option value="updated">Sort: Recently updated</option>
              <option value="name">Sort: Name (A–Z)</option>
            </select>
            <select value={langFilter} onChange={(e) => setLangFilter(e.target.value)} className="glass-card px-3 py-2 text-sm bg-transparent outline-none">
              <option value="all">All languages</option>
              {languageOptions.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <span className="text-xs opacity-50 ml-auto">{filteredRepos.length} repositories</span>
          </div>

          {filteredRepos.length === 0 ? (
            <EmptyState icon="fork" title="No repositories match" subtitle="Try a different language filter." />
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRepos.slice(0, visibleCount).map((r) => (
                  <RepoCard key={r.id} repo={r} onCopy={() => copyToClipboard(r.html_url).then((ok) => pushToast(ok ? 'Repo link copied.' : 'Copy failed.', ok ? 'success' : 'error'))} />
                ))}
              </div>
              {visibleCount < filteredRepos.length && (
                <div className="flex justify-center mt-6">
                  <button onClick={() => setVisibleCount((v) => v + 9)} className="btn-ghost">Load more repositories</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div className="grid lg:grid-cols-2 gap-5 mt-6">
          <div className="glass-card p-5 lg:col-span-2">
            <h3 className="font-semibold mb-1">Recent commit activity</h3>
            <p className="text-xs opacity-50 mb-4">Sampled from the 6 most recently pushed repositories.</p>
            {commitDates.length === 0 ? <EmptyState icon="trend" title="No recent commit data" /> : <ActivityHeatmap commits={commitDates} />}
          </div>
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3">Pull requests ({pulls.length})</h3>
            <ListBlock items={pulls.slice(0, 8)} render={(p) => (
              <>
                <span className={`chip ${p.state === 'open' ? 'text-pulse-cyan' : 'text-pulse-rose'}`}>{p.state}</span>
                <a href={p.html_url} target="_blank" rel="noreferrer" className="text-sm hover:text-pulse-violet truncate flex-1">{p.title}</a>
              </>
            )} empty="No pull requests found." />
          </div>
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3">Issues ({issues.length})</h3>
            <ListBlock items={issues.slice(0, 8)} render={(it) => (
              <>
                <span className={`chip ${it.state === 'open' ? 'text-pulse-amber' : 'text-pulse-cyan'}`}>{it.state}</span>
                <a href={it.html_url} target="_blank" rel="noreferrer" className="text-sm hover:text-pulse-violet truncate flex-1">{it.title}</a>
              </>
            )} empty="No issues found." />
          </div>
          <div className="glass-card p-5 lg:col-span-2">
            <h3 className="font-semibold mb-3">Release history ({releases.length})</h3>
            <ListBlock items={releases.slice(0, 8)} render={(r) => (
              <>
                <span className="chip">{r.repoName}</span>
                <a href={r.html_url} target="_blank" rel="noreferrer" className="text-sm hover:text-pulse-violet truncate flex-1">{r.name || r.tag_name}</a>
                <span className="text-xs opacity-50 shrink-0">{new Date(r.published_at || r.created_at).toLocaleDateString()}</span>
              </>
            )} empty="No releases found." />
          </div>
        </div>
      )}

      {tab === 'orgs' && (
        <div className="mt-6">
          {orgs.length === 0 ? (
            <EmptyState icon="org" title="No public organizations" subtitle={`${user.login} isn't a public member of any organization.`} />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgs.map((o) => (
                <a key={o.id} href={`https://github.com/${o.login}`} target="_blank" rel="noreferrer" className="glass-card p-5 flex items-center gap-3 hover:-translate-y-0.5">
                  <img src={o.avatar_url} alt={o.login} className="w-12 h-12 rounded-xl" />
                  <div>
                    <p className="font-semibold">{o.login}</p>
                    <p className="text-xs opacity-50">{o.description || 'GitHub organization'}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RepoCard({ repo, onCopy }) {
  const health = repoHealthScore(repo)
  return (
    <div className="glass-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <a href={repo.html_url} target="_blank" rel="noreferrer" className="font-semibold hover:text-pulse-violet truncate">{repo.name}</a>
        <button onClick={onCopy} className="opacity-50 hover:opacity-100 shrink-0" aria-label="Copy repo link"><Icon name="link" className="w-4 h-4" /></button>
      </div>
      <p className="text-xs opacity-60 line-clamp-2 min-h-[2.2em]">{repo.description || 'No description provided.'}</p>
      <div className="flex flex-wrap gap-1.5">
        {repo.language && <span className="chip">{repo.language}</span>}
        {repo.archived && <span className="chip text-pulse-rose">Archived</span>}
        <span className="chip">Health {health}</span>
      </div>
      <div className="flex items-center gap-3 text-xs opacity-60 mt-1">
        <span className="flex items-center gap-1"><Icon name="star" className="w-3.5 h-3.5" />{repo.stargazers_count}</span>
        <span className="flex items-center gap-1"><Icon name="fork" className="w-3.5 h-3.5" />{repo.forks_count}</span>
        <span className="flex items-center gap-1"><Icon name="eye" className="w-3.5 h-3.5" />{repo.watchers_count}</span>
        <span className="flex items-center gap-1"><Icon name="issue" className="w-3.5 h-3.5" />{repo.open_issues_count}</span>
      </div>
    </div>
  )
}

function ListBlock({ items, render, empty }) {
  if (!items.length) return <p className="text-sm opacity-50">{empty}</p>
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 py-1.5 border-b border-black/5 dark:border-white/5 last:border-0">
          {render(item)}
        </div>
      ))}
    </div>
  )
}
