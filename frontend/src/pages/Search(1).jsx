import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { searchAPI } from '../api'

function debounce(fn, ms) {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const doSearch = useCallback(debounce(async (q) => {
    if (!q.trim()) { setResults(null); return }
    setLoading(true)
    try {
      const res = await searchAPI.search(q)
      setResults(res.data)
    } catch { setResults(null) }
    finally { setLoading(false) }
  }, 400), [])

  const handleChange = (e) => {
    setQuery(e.target.value)
    doSearch(e.target.value)
  }

  const total = results ? (results.modules?.length + results.lessons?.length + results.news?.length + results.users?.length) : 0

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🔍 Qidiruv</h1>
      </div>

      <div className="search-bar" style={{ marginBottom: 24 }}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Kurs, dars, yangilik yoki foydalanuvchi..."
          value={query}
          onChange={handleChange}
          autoFocus
        />
        {loading && <div className="spinner" style={{ width:16, height:16 }} />}
      </div>

      {!query && (
        <div className="empty">
          <span className="empty-icon">🔍</span>
          <p className="empty-title">Qidirishni boshlang</p>
          <p className="empty-desc">Kurs, dars, yangilik yoki foydalanuvchi nomini kiriting</p>
        </div>
      )}

      {results && total === 0 && query && (
        <div className="empty">
          <span className="empty-icon">😕</span>
          <p className="empty-title">Natija topilmadi</p>
          <p className="empty-desc">"{query}" bo'yicha hech narsa topilmadi</p>
        </div>
      )}

      {results && total > 0 && (
        <div>
          {results.modules?.length > 0 && (
            <Section title="📚 Kurslar">
              {results.modules.map(m => (
                <Link key={m.id} to={`/modules/${m.id}`}>
                  <div className="card card-sm" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                    <span style={{ fontSize:24 }}>{m.icon || '📚'}</span>
                    <div>
                      <p style={{ fontSize:14, fontWeight:600 }}>{m.title}</p>
                      <p style={{ fontSize:12, color:'var(--text3)' }}>{m.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </Section>
          )}

          {results.lessons?.length > 0 && (
            <Section title="📖 Darslar">
              {results.lessons.map(l => (
                <Link key={l.id} to={`/lesson/${l.id}`}>
                  <div className="card card-sm" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                    <span style={{ fontSize:20 }}>📄</span>
                    <p style={{ fontSize:14, fontWeight:600 }}>{l.title}</p>
                  </div>
                </Link>
              ))}
            </Section>
          )}

          {results.news?.length > 0 && (
            <Section title="📰 Yangiliklar">
              {results.news.map(n => (
                <Link key={n.id} to={`/news/${n.id}`}>
                  <div className="card card-sm" style={{ marginBottom:8 }}>
                    <p style={{ fontSize:14, fontWeight:600 }}>{n.title}</p>
                  </div>
                </Link>
              ))}
            </Section>
          )}

          {results.users?.length > 0 && (
            <Section title="👥 Foydalanuvchilar">
              {results.users.map(u => (
                <div key={u.id} className="card card-sm" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--primary-dim)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'var(--primary-light)', flexShrink:0 }}>
                    {u.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:600 }}>{u.full_name}</p>
                    {u.username && <p style={{ fontSize:12, color:'var(--text3)' }}>@{u.username}</p>}
                  </div>
                  <span className="badge badge-gold" style={{ marginLeft:'auto' }}>{u.total_xp} XP</span>
                </div>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p className="section-title" style={{ marginBottom: 12 }}>{title}</p>
      {children}
    </div>
  )
}
