import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon, BookOpen, FileText, Newspaper, Users, Crown } from 'lucide-react'
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
    const clean = q.trim().replace(/^@/, '') // @ bilan kiritsa ham ishlaydi
    if (!clean) { setResults(null); return }
    setLoading(true)
    try {
      const res = await searchAPI.search(clean)
      setResults(res.data)
    } catch {
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, 400), [])

  const handleChange = (e) => {
    setQuery(e.target.value)
    doSearch(e.target.value)
  }

  const modules = results?.modules || []
  const lessons = results?.lessons || []
  const news = results?.news || []
  const users = results?.users || []
  const total = modules.length + lessons.length + news.length + users.length

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <span className="emoji-soft" style={{ fontSize: 26 }}>🔍</span>
        <div>
          <h1 className="page-title">Qidiruv</h1>
          <p className="page-subtitle">Kurs, dars, yangilik, foydalanuvchi</p>
        </div>
      </div>

      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <SearchIcon
          size={17}
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}
        />
        <input
          type="text"
          placeholder="Ism, username, kurs, dars..."
          value={query}
          onChange={handleChange}
          autoFocus
          style={{
            width: '100%', padding: '12px 40px 12px 42px',
            background: 'var(--surface)', border: '1.5px solid var(--border)',
            borderRadius: 14, color: 'var(--text)', fontSize: 14,
            outline: 'none', fontFamily: 'var(--font)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        />
        {loading && (
          <div style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            width: 16, height: 16, border: '2px solid var(--border)', borderTopColor: 'var(--primary)',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
        )}
      </div>

      {/* Empty state */}
      {!query && (
        <div className="empty">
          <span className="empty-icon">🔍</span>
          <p className="empty-title">Qidirishni boshlang</p>
          <p className="empty-desc">Kurs, dars, yangilik yoki foydalanuvchi nomini kiriting</p>
        </div>
      )}

      {/* No results */}
      {results && total === 0 && query && (
        <div className="empty">
          <span className="empty-icon">😕</span>
          <p className="empty-title">Natija topilmadi</p>
          <p className="empty-desc">"{query}" bo'yicha hech narsa topilmadi</p>
        </div>
      )}

      {/* Results */}
      {results && total > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Modules */}
          {modules.length > 0 && (
            <div>
              <SectionTitle icon={<BookOpen size={14} />} title="Kurslar" count={modules.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {modules.map(m => (
                  <Link key={m.id} to={`/modules/${m.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{m.icon || '📚'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{m.title}</p>
                        {m.description && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1 }} className="truncate">{m.description}</p>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Lessons */}
          {lessons.length > 0 && (
            <div>
              <SectionTitle icon={<FileText size={14} />} title="Darslar" count={lessons.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lessons.map(l => (
                  <Link key={l.id} to={`/lesson/${l.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={16} style={{ color: 'var(--primary)' }} />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{l.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* News */}
          {news.length > 0 && (
            <div>
              <SectionTitle icon={<Newspaper size={14} />} title="Yangiliklar" count={news.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {news.map(n => (
                  <Link key={n.id} to={`/news/${n.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card card-sm">
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{n.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {users.length > 0 && (
            <div>
              <SectionTitle icon={<Users size={14} />} title="Foydalanuvchilar" count={users.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {users.map(u => (
                  <div key={u.id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--primary-dim)', border: '2px solid rgba(123,79,58,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 16, color: 'var(--primary)', overflow: 'hidden',
                    }}>
                      {u.photo_url
                        ? <img src={u.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : u.full_name?.[0] || '?'
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{u.full_name}</p>
                      {u.username && (
                        <p style={{ fontSize: 12, color: 'var(--text3)' }}>@{u.username}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {u.is_premium && <Crown size={13} style={{ color: 'var(--gold)' }} />}
                      <span style={{
                        fontSize: 12, fontWeight: 700, color: 'var(--primary)',
                        background: 'var(--primary-dim)', padding: '3px 8px', borderRadius: 20,
                      }}>
                        {(u.total_xp || 0).toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

function SectionTitle({ icon, title, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <span style={{ color: 'var(--primary)' }}>{icon}</span>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {title}
      </p>
      <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--bg2)', padding: '1px 7px', borderRadius: 20, border: '1px solid var(--border)' }}>
        {count}
      </span>
    </div>
  )
}
