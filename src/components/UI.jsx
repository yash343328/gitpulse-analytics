// src/components/UI.jsx
import { useApp } from '../lib/AppContext'

export function Icon({ name, className = 'w-5 h-5', ...rest }) {
  const paths = {
    sun: <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-6.66 1.41-1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M4.93 4.93 6.34 6.34M12 7a5 5 0 100 10 5 5 0 000-10z" />,
    moon: <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />,
    search: <path d="M11 19a8 8 0 100-16 8 8 0 000 16zm10 2-4.35-4.35" />,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z" />,
    fork: <path d="M6 3v6m12-6v6M6 9a3 3 0 003 3h6a3 3 0 003-3M12 12v6m-4 0h8" />,
    eye: <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z M12 15a3 3 0 100-6 3 3 0 000 6z" />,
    issue: <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 7v6m0 4h.01" />,
    download: <path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" />,
    share: <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14" />,
    link: <path d="M10 13a5 5 0 007 0l3-3a5 5 0 10-7-7l-1 1M14 11a5 5 0 00-7 0l-3 3a5 5 0 107 7l1-1" />,
    heart: <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />,
    clock: <path d="M12 7v5l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    grid: <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />,
    trend: <path d="M3 17l6-6 4 4 8-8M21 7v6h-6" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    chevron: <path d="M9 18l6-6-6-6" />,
    user: <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />,
    org: <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1" />,
    bolt: <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />,
    csv: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M8 13h1m2 0h1m2 0h1" />
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...rest}>
      {paths[name] || null}
    </svg>
  )
}

export function ToastStack() {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[calc(100%-2.5rem)] sm:w-80">
      {toasts.map((t) => (
        <div key={t.id} className="glass-card px-4 py-3 flex items-start gap-3 animate-fade-up" role="status">
          <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${t.type === 'error' ? 'bg-pulse-rose' : t.type === 'success' ? 'bg-pulse-cyan' : 'bg-pulse-violet'}`} />
          <p className="text-sm flex-1">{t.message}</p>
          <button onClick={() => dismissToast(t.id)} className="opacity-50 hover:opacity-100" aria-label="Dismiss">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`skeleton ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

export function EmptyState({ icon = 'search', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 animate-fade-up">
      <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-5 animate-float">
        <Icon name={icon} className="w-7 h-7 text-pulse-violet" />
      </div>
      <h3 className="font-display text-xl font-semibold mb-1">{title}</h3>
      {subtitle && <p className="text-sm opacity-60 max-w-sm">{subtitle}</p>}
      {action}
    </div>
  )
}

export function StatPill({ icon, label, value }) {
  return (
    <div className="chip flex items-center gap-1.5">
      <Icon name={icon} className="w-3.5 h-3.5" />
      <span className="font-mono">{value}</span>
      <span className="opacity-60">{label}</span>
    </div>
  )
}
