import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookmarksAPI } from '../api'

const TYPE_CONFIG = {
  lesson: { icon: '📖', label: 'Dars', path: '/lesson/' },
  quiz: { icon: '❓', label: 'Test', path: '/quiz/' },
  module: { icon: '📚', label: 'Kurs', path: '/modules/' },
}

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    bookmarksAPI.getAll()
      .then(r => setBookmarks(r.data))
      .finally(() => setLoading(false))
  }, [])

  const remove = async (id) => {
    try {
      await bookmarksAPI.remove(id)
      setBookmarks(prev => prev.filter(b => b.id !== id))
    } catch {}
  }

  const filtered = filter === 'all' ? bookmarks : bookmarks.filter(b => b.content_type === filter)

  if (loading) return <div className="loader-full"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🔖 Saqlangan</h1>
        <span className="badge badge-primary">{bookmarks.length}</span>
      </div>

      <div className="tabs">
        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Hammasi</button>
        <button className={`tab ${filter === 'lesson' ? 'active' : ''}`} onClick={() => setFilter('lesson')}>📖 Dars</button>
        <button className={`tab ${filter === 'module' ? 'active' : ''}`} onClick={() => setFilter('module')}>📚 Kurs</button>
        <button className={`tab ${filter === 'quiz' ? 'active' : ''}`} onClick={() => setFilter('quiz')}>❓ Test</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">🔖</span>
          <p className="empty-title">Saqlangan yo'q</p>
          <p className="empty-desc">Dars yoki kurslarni saqlash uchun 🔖 tugmasini bosing</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(b => {
            const cfg = TYPE_CONFIG[b.content_type] || TYPE_CONFIG.lesson
            return (
              <div key={b.id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Link to={`${cfg.path}${b.content_id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {cfg.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="badge badge-cyan" style={{ fontSize: 10 }}>{cfg.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {new Date(b.created_at).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  </div>
                </Link>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => remove(b.id)}
                  style={{ padding: '6px 8px', flexShrink: 0 }}
                >
                  🗑
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
