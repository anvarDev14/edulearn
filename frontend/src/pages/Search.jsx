import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, BookOpen, GraduationCap, Newspaper, Users, X, Loader2 } from 'lucide-react'
import { searchAPI } from '../api'

function debounce(fn, ms) {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}

const sectionMeta = {
  modules: { icon: GraduationCap, label: 'Kurslar', color: 'var(--green)', dim: 'var(--green-dim)' },
  lessons: { icon: BookOpen, label: 'Darslar', color: 'var(--primary-light)', dim: 'var(--primary-dim)' },
  news: { icon: Newspaper, label: 'Yangiliklar', color: 'var(--accent)', dim: 'var(--accent-dim)' },
  users: { icon: Users, label: 'Foydalanuvchilar', color: 'var(--gold)', dim: 'var(--gold-dim)' },
}

const sectionPaths = {
  modules: '/modules/',
  lessons: '/lesson/',
  news: '/news/',
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

  const clear = () => {
    setQuery('')
    setResults(null)
  }

  const total = results
    ? (results.modules?.length || 0) + (results.lessons?.length || 0) + (results.news?.length || 0) + (results.users?.length || 0)
    : 0

  const trendingTopics = ['Algebra', 'Python', 'Fizika', 'Kimyo', 'Geometriya', 'Tarix']

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: 'var(--accent-dim)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <SearchIcon size={20} color="var(--accent)" />
          </div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Qidiruv</h1>
        </div>
      </div>

      {/* Search Input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--surface)', border: '1.5px solid var(--border2)',
        borderRadius: 16, padding: '13px 16px', marginBottom: 24,
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      }}>
        {loading
          ? <Loader2 size={20} color="var(--primary-light)" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          : <SearchIcon size={20} color="var(--text3)" style={{ flexShrink: 0 }} />
        }
        <input
          type="text"
          placeholder="Kurs, dars, yangilik yoki foydalanuvchi..."
          value={query}
          onChange={handleChange}
          autoFocus
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: 15,
          }}
        />
        {query && (
          <button onClick={clear} style={{
            background: 'var(--surface2)', border: 'none', borderRadius: 8,
            width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text3)', cursor: 'pointer',
          }}>
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!query && (
          <motion.div key="empty-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12 }}>
              Mashhur mavzular
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
              {trendingTopics.map(topic => (
                <button
                  key={topic}
                  onClick={() => { setQuery(topic); doSearch(topic) }}
                  style={{
                    padding: '8px 16px', borderRadius: 50,
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    color: 'var(--text2)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
            <div className="empty">
              <span className="empty-icon emoji-soft">🔍</span>
              <p className="empty-title">Qidirishni boshlang</p>
              <p className="empty-desc">Kurs, dars, yangilik yoki foydalanuvchi nomini kiriting</p>
            </div>
          </motion.div>
        )}

        {query && results && total === 0 && (
          <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="empty">
            <span className="empty-icon emoji-soft">😕</span>
            <p className="empty-title">Natija topilmadi</p>
            <p className="empty-desc">"{query}" bo'yicha hech narsa topilmadi</p>
          </motion.div>
        )}

        {results && total > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>
              <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{total}</span> ta natija topildi
            </p>

            {(['modules', 'lessons', 'news', 'users']).map(key => {
              const items = results[key]
              if (!items?.length) return null
              const meta = sectionMeta[key]
              const Icon = meta.icon
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: 28 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, background: meta.dim,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={15} color={meta.color} />
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{meta.label}</p>
                    <span style={{
                      marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                      background: meta.dim, color: meta.color,
                      padding: '2px 8px', borderRadius: 50,
                    }}>
                      {items.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {key === 'users' ? (
                      items.map((u, i) => (
                        <motion.div
                          key={u.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="card card-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                        >
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: meta.dim, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, color: meta.color, fontSize: 16,
                          }}>
                            {u.full_name?.[0] || '?'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 600 }}>{u.full_name}</p>
                            {u.username && <p style={{ fontSize: 12, color: 'var(--text3)' }}>@{u.username}</p>}
                          </div>
                          <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>⚡ {u.total_xp} XP</span>
                        </motion.div>
                      ))
                    ) : (
                      items.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <Link to={`${sectionPaths[key]}${item.id}`}>
                            <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 40, height: 40, borderRadius: 11, background: meta.dim,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                {key === 'modules' && item.icon
                                  ? <span style={{ fontSize: 20 }}>{item.icon}</span>
                                  : <Icon size={18} color={meta.color} />
                                }
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.title}
                                </p>
                                {item.description && (
                                  <p style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
