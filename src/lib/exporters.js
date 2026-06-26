// src/lib/exporters.js
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `${filename}.json`)
}

export function exportCSV(filename, rows) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  downloadBlob(blob, `${filename}.csv`)
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportPDFReport({ user, repos, score }) {
  const doc = new jsPDF()
  doc.setFontSize(20)
  doc.setTextColor(124, 92, 255)
  doc.text('GitPulse Analytics Report', 14, 18)
  doc.setFontSize(11)
  doc.setTextColor(40)
  doc.text(`${user.name || user.login} (@${user.login})`, 14, 28)
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text(`Generated ${new Date().toLocaleString()} · Developer score: ${score}/100`, 14, 34)

  autoTable(doc, {
    startY: 42,
    head: [['Metric', 'Value']],
    body: [
      ['Public repos', user.public_repos],
      ['Followers', user.followers],
      ['Following', user.following],
      ['Total stars', repos.reduce((s, r) => s + r.stargazers_count, 0)],
      ['Total forks', repos.reduce((s, r) => s + r.forks_count, 0)],
      ['Account created', new Date(user.created_at).toLocaleDateString()]
    ],
    theme: 'grid',
    headStyles: { fillColor: [124, 92, 255] }
  })

  const top = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 10)
  autoTable(doc, {
    head: [['Repository', 'Stars', 'Forks', 'Language', 'Updated']],
    body: top.map((r) => [r.name, r.stargazers_count, r.forks_count, r.language || '—', new Date(r.pushed_at).toLocaleDateString()]),
    theme: 'striped',
    headStyles: { fillColor: [51, 224, 196] }
  })

  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text('Developed by Yash Jain — GitPulse', 14, doc.internal.pageSize.height - 8)
  doc.save(`gitpulse-${user.login}.pdf`)
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (_) {
    return false
  }
}
