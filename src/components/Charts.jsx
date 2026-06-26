// src/components/Charts.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from 'recharts'

export const PALETTE = ['#7c5cff', '#33e0c4', '#ffb648', '#ff5c8a', '#5b8cff', '#9b59ff', '#2dd4bf', '#fb923c', '#f472b6', '#60a5fa']

const tooltipStyle = {
  background: 'rgba(17,20,27,0.95)',
  border: '1px solid rgba(124,92,255,0.3)',
  borderRadius: 10,
  color: '#fff',
  fontSize: 12
}

export function LanguagePie({ data }) {
  if (!data.length) return null
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v.toFixed(1)}%`, n]} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function RepoBarChart({ data, dataKey = 'stars', xKey = 'name' }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,255,0.12)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(124,92,255,0.08)' }} />
        <Bar dataKey={dataKey} radius={[8, 8, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function GrowthLineChart({ data, lines }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,255,0.12)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {lines.map((l, i) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={PALETTE[i % PALETTE.length]} strokeWidth={2.5} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function ActivityHeatmap({ commits }) {
  // commits: array of Date objects (commit timestamps), build a 7x18-ish grid for ~last 18 weeks
  const weeks = 18
  const days = 7
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(start.getDate() - (weeks * 7 - 1))

  const counts = {}
  commits.forEach((d) => {
    const key = d.toISOString().slice(0, 10)
    counts[key] = (counts[key] || 0) + 1
  })

  const max = Math.max(1, ...Object.values(counts))
  const cells = []
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < days; d++) {
      const date = new Date(start)
      date.setDate(date.getDate() + w * 7 + d)
      const key = date.toISOString().slice(0, 10)
      const count = counts[key] || 0
      const intensity = count === 0 ? 0 : Math.min(1, count / max)
      cells.push({ w, d, count, date: key, intensity })
    }
  }

  function color(intensity) {
    if (intensity === 0) return 'rgba(124,92,255,0.08)'
    const alpha = 0.25 + intensity * 0.75
    return `rgba(124,92,255,${alpha})`
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid grid-flow-col gap-1" style={{ gridTemplateRows: 'repeat(7, 12px)' }}>
        {cells.map((c, i) => (
          <div key={i} title={`${c.date}: ${c.count} commits`} className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: color(c.intensity) }} />
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-xs opacity-50">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <div key={v} className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: color(v) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

export function ScoreRing({ score, size = 96, label = 'Score' }) {
  const r = (size - 14) / 2
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score > 70 ? '#33e0c4' : score > 40 ? '#ffb648' : '#ff5c8a'
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(124,92,255,0.12)" strokeWidth="9" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="9" fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-xl">{score}</span>
        <span className="text-[10px] opacity-50">{label}</span>
      </div>
    </div>
  )
}
