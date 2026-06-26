// src/lib/useProfileData.js
import { useEffect, useState } from 'react'
import { gh, aggregateLanguages, computeScore } from './github'

export function useProfileData(username) {
  const [state, setState] = useState({ loading: true, error: null, data: null })

  useEffect(() => {
    if (!username) return
    let cancelled = false
    setState({ loading: true, error: null, data: null })

    async function run() {
      try {
        const [user, repos, orgs] = await Promise.all([
          gh.user(username),
          gh.repos(username),
          gh.orgs(username).catch(() => [])
        ])

        const [followers, following] = await Promise.all([
          gh.followers(username).catch(() => []),
          gh.following(username).catch(() => [])
        ])

        const languages = await aggregateLanguages(username, repos)

        const topRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 8)

        // pull recent commits + PRs + issues + releases from top 6 active repos
        const sampleRepos = [...repos].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at)).slice(0, 6)
        const details = await Promise.allSettled(
          sampleRepos.map(async (r) => {
            const [commits, pulls, issues, releases] = await Promise.all([
              gh.repoCommits(username, r.name).catch(() => []),
              gh.repoPulls(username, r.name).catch(() => []),
              gh.repoIssues(username, r.name).catch(() => []),
              gh.repoReleases(username, r.name).catch(() => [])
            ])
            return { repo: r.name, commits, pulls, issues, releases }
          })
        )

        const fulfilled = details.filter((d) => d.status === 'fulfilled').map((d) => d.value)
        const commitDates = fulfilled.flatMap((d) => d.commits.map((c) => new Date(c.commit.author.date)))
        const pulls = fulfilled.flatMap((d) => d.pulls.map((p) => ({ ...p, repoName: d.repo })))
        const issues = fulfilled.flatMap((d) => d.issues.filter((i) => !i.pull_request).map((it) => ({ ...it, repoName: d.repo })))
        const releases = fulfilled.flatMap((d) => d.releases.map((r) => ({ ...r, repoName: d.repo })))

        const score = computeScore({ user, repos, followers: user.followers })

        const data = {
          user, repos, orgs, followers, following, languages,
          topRepos, commitDates, pulls, issues, releases
        }

        if (!cancelled) setState({ loading: false, error: null, data })
      } catch (err) {
        if (!cancelled) setState({ loading: false, error: err, data: null })
      }
    }

    run()
    return () => { cancelled = true }
  }, [username])

  return state
}
