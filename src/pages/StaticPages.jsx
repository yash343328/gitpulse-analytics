// src/pages/StaticPages.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/UI'
import { useApp } from '../lib/AppContext'

function PageShell({ eyebrow, title, children }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 animate-fade-up">
      <span className="chip mb-4 inline-flex">{eyebrow}</span>
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-6">{title}</h1>
      <div className="prose-sm space-y-4 text-sm sm:text-[15px] leading-relaxed opacity-80">{children}</div>
    </div>
  )
}

export function About() {
  return (
    <PageShell eyebrow="About GitPulse" title="Analytics built for the way developers actually work">
      <p>GitPulse turns the raw GitHub REST API into a readable, exportable analytics dashboard. Type a username, and within seconds you get commit activity, language breakdowns, repository health, growth trends and more — all rendered with interactive charts instead of raw JSON.</p>
      <p>The project draws inspiration from earlier GitHub analytics tools, rebuilt from scratch with a modern React architecture, client-side caching to respect API rate limits, and a premium glassmorphism interface that works just as well on a phone as it does on a 27-inch monitor.</p>
      <p>Everything you see — search history, favorites and preferences — lives entirely in your browser's local storage. GitPulse never runs its own backend and never stores your data on a server.</p>
      <p className="font-medium opacity-100">Developed by Yash Jain.</p>
    </PageShell>
  )
}

export function Contact() {
  const { pushToast } = useApp()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      pushToast('Please fill in every field.', 'error')
      return
    }
    setSent(true)
    pushToast('Message saved locally — thanks for reaching out!', 'success')
  }

  return (
    <PageShell eyebrow="Get in touch" title="Contact">
      <p>Questions, feedback or feature requests for GitPulse? Send a note below — this demo form keeps your message on-device since GitPulse doesn't run a backend, but it shows the full flow end to end.</p>
      {sent ? (
        <div className="glass-card p-6 mt-4 text-center">
          <Icon name="bolt" className="w-6 h-6 text-pulse-cyan mx-auto mb-2" />
          <p>Thanks, {form.name}! Your message has been recorded.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="glass-card p-6 mt-4 grid gap-4 not-prose">
          <input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-transparent border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pulse-violet/50" />
          <input placeholder="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-transparent border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pulse-violet/50" />
          <textarea placeholder="Your message" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-transparent border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pulse-violet/50" />
          <button type="submit" className="btn-primary self-start">Send message</button>
        </form>
      )}
    </PageShell>
  )
}

export function Privacy() {
  return (
    <PageShell eyebrow="Last updated June 2026" title="Privacy Policy">
      <p>GitPulse is a client-side application. It does not operate its own server, database, or analytics pipeline, and it does not collect or sell personal data.</p>
      <p><strong>Data we read:</strong> when you search a username, GitPulse calls the public GitHub REST API directly from your browser to fetch profile, repository, and activity data that is already public on github.com.</p>
      <p><strong>Data stored on your device:</strong> search history, favorites, and preferences are saved in your browser's local storage. This data never leaves your device and is removed if you clear your browser storage or use the “Clear local data” option in Settings.</p>
      <p><strong>Third parties:</strong> requests are sent to api.github.com under GitHub's own privacy policy and rate-limit rules. GitPulse does not embed third-party trackers or advertising scripts.</p>
      <p>If GitPulse is deployed with a personal access token, that token is read from an environment variable at build time and is never logged or exposed to other users.</p>
    </PageShell>
  )
}

export function Terms() {
  return (
    <PageShell eyebrow="Last updated June 2026" title="Terms & Conditions">
      <p>By using GitPulse you agree to use it for lawful, personal, or professional analytics purposes only, and to respect GitHub's own Terms of Service and API usage policies when data is requested on your behalf.</p>
      <p>GitPulse is provided “as is”, without warranty of any kind. Analytics, scores, and charts are computed from publicly available data and are intended for informational purposes — they are not an official GitHub product and are not guaranteed to be perfectly accurate or up to date.</p>
      <p>You may not use GitPulse to scrape, harvest, or redistribute GitHub data in a way that violates GitHub's Acceptable Use Policies, or to circumvent GitHub API rate limits.</p>
      <p>These terms may be updated as the project evolves. Continued use of GitPulse after a change constitutes acceptance of the revised terms.</p>
    </PageShell>
  )
}

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 animate-fade-up">
      <p className="font-display text-7xl sm:text-8xl font-bold gradient-text">404</p>
      <h1 className="font-display text-xl sm:text-2xl font-semibold mt-3">This repository doesn't exist</h1>
      <p className="opacity-60 mt-2 max-w-sm text-sm">The page you're looking for was moved, renamed, or never committed in the first place.</p>
      <Link to="/" className="btn-primary mt-6">Back to GitPulse</Link>
    </div>
  )
}
