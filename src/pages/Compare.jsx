// src/pages/Compare.jsx
import { useState } from 'react'
import { useProfileData } from '../lib/useProfileData'
import { CardSkeleton, EmptyState, Icon, StatPill } from '../components/UI'
import { computeScore } from '../lib/github'
import { ScoreRing } from '../components/Charts'

function fmt(n) { if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k'; return String(n) }

function Side({ username }) {
  const { loading, error, data } = useProfileData(username)
  if (!username) return <EmptyState icon="user" title="Enter a username" subtitle="Pick a GitHub profile to compare." />
  if (loading) return <CardSkeleton />
  if (error) return <EmptyState icon="search" title="User not found" subtitle={error.message} />
  const { user, repos, followers } = data
  const score = computeScore({ user, repos, followers: followers.length })
  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0)
  const forks = repos.reduce((s, r) => s + r.forks_count, 0)
  return (
    <div className="glass-card p-6 flex flex-col items-center text-center gap-3 animate-fade-up">
      <img src={user.avatar_url} className="w-20 h-20 rounded-2xl" alt={user.login} />
      <p className="font-display font-bold text-lg">{user.name || user.login}</p>
      <p className="text-xs opacity-50">@{user.login}</p>
      <ScoreRing score={score} />
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        <StatPill icon="user" label="followers" value={fmt(user.followers)} />
        <StatPill icon="fork" label="repos" value={fmt(user.public_repos)} />
        <StatPill icon="star" label="stars" value={fmt(stars)} />
        <StatPill icon="fork" label="forks" value={fmt(forks)} />
      </div>
    </div>
  )
}

export default function Compare() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [committedA, setCommittedA] = useState('')
  const [committedB, setCommittedB] = useState('')

  function run(e) {
    e.preventDefault()
    setCommittedA(a.trim())
    setCommittedB(b.trim())
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Compare profiles</h1>
      <p className="opacity-60 text-sm mb-6">Put two GitHub usernames head-to-head across score, stars, forks and followers.</p>
      <form onSubmit={run} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="glass-card flex items-center gap-2 px-3.5 py-2.5 flex-1">
          <Icon name="user" className="w-4 h-4 opacity-50" />
          <input value={a} onChange={(e) => setA(e.target.value)} placeholder="First username" className="bg-transparent outline-none w-full text-sm" />
        </div>
        <div className="glass-card flex items-center gap-2 px-3.5 py-2.5 flex-1">
          <Icon name="user" className="w-4 h-4 opacity-50" />
          <input value={b} onChange={(e) => setB(e.target.value)} placeholder="Second username" className="bg-transparent outline-none w-full text-sm" />
        </div>
        <button type="submit" className="btn-primary">Compare</button>
      </form>

      <div className="grid sm:grid-cols-2 gap-5">
        <Side username={committedA} />
        <Side username={committedB} />
      </div>
    </div>
  )
}
