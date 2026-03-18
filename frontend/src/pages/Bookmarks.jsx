import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, BookOpen, HelpCircle, GraduationCap, Trash2, Loader2 } from 'lucide-react'
import { bookmarksAPI } from '../api'

const TYPE_CONFIG = {
  lesson: { icon: BookOpen, label: 'Dars', path: '/lesson/', color: 'var(--primary)', dim: 'var(--primary-dim)' },
  quiz: { icon: HelpCircle, label: 'Test', path: '/quiz/', color: 'var(--accent)', dim: 'var(--accent-dim)' },
  module: { icon: GraduationCap, label: 'Kurs', path: '/modules/', color: 'var(--green)', dim: 'var(--green-dim)' },
}

const filterTabs = [
  { key: 'all', label: 'Hammasi' },
  { key: 'lesson', label: 'Darslar' },
  { key: 'module', label: 'Kurslar' },
  { key: 'quiz', label: 'Testlar' },
]

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    bookmarksAPI.getAll()
      .then(r => setBookmarks(r.data))
      .finally(() => setLoading(false))
  }, [])

  const remove = async (id) => {
    setRemoving(id)
    try {
      await bookmarksAPI.remove(id)
      setBookmarks(prev => prev.filter(b => b.id !== id))
    } catch {} finally { setRemoving(null) }
  }

  const filtered = filter === 'all' ? bookmarks : bookmarks.filter(b => b.content_type === filter)

  const counts = {
    all: bookmarks.length,
    lesson: bookmarks.filter(b => b.content_type === 'lesson').length,
    module: bookmarks.filter(b => b.content_type === 'module').length,
    quiz: bookmarks.filter(b => b.content_type === 'quiz').length,
  }

  if (loading) return <div className="loader-full"><div className="spinner" /></div>

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: 'var(--gold-dim)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Bookmark size={20} color="var(--gold)" />
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Saqlangan</h1>
            <p className="page-subtitle">{bookmarks.length} ta element</p>
          </div>
        </div>
        {bookmarks.length > 0 && (
          <span className="badge badge-gold">{bookmarks.length}</span>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto',
        paddingBottom: 2,
      }}>
        {filterTabs.map(t => {
          const isActive = filter === t.key
          const count = counts[t.key]
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 10,
                border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                background: isActive ? 'var(--primary-dim)' : 'transparent',
                color: isActive ? 'var(--primary-light)' : 'var(--text3)',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
            >
              {t.label}
              {count > 0 && (
                <span style={{
                  background: isActive ? 'var(--primary)' : 'var(--surface2)',
                  color: isActive ? 'white' : 'var(--text3)',
                  borderRadius: 50, padding: '1px 7px', fontSize: 11,
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="empty"
          >
            <span className="empty-icon emoji-soft">🔖</span>
            <p className="empty-title">
              {filter === 'all' ? 'Saqlangan yo\'q' : `${filterTabs.find(t => t.key === filter)?.label} yo'q`}
            </p>
            <p className="empty-desc">
              {filter === 'all'
                ? 'Dars yoki kurslarni saqlash uchun 🔖 tugmasini bosing'
                : 'Bu toifada saqlangan element topilmadi'
              }
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {filtered.map((b, i) => {
              const cfg = TYPE_CONFIG[b.content_type] || TYPE_CONFIG.lesson
              const Icon = cfg.icon
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card card-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 14 }}
                >
                  <Link
                    to={`${cfg.path}${b.content_id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: cfg.dim, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={20} color={cfg.color} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: 14, fontWeight: 600, marginBottom: 4,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {b.title}
                      </p>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '2px 8px', borderRadius: 50, fontSize: 10, fontWeight: 700,
                          background: cfg.dim, color: cfg.color,
                        }}>
                          <Icon size={10} />
                          {cfg.label}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                          {new Date(b.created_at).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => remove(b.id)}
                    disabled={removing === b.id}
                    style={{
                      width: 34, height: 34, borderRadius: 10, border: 'none',
                      background: 'var(--red-dim)', color: 'var(--red)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    {removing === b.id
                      ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                      : <Trash2 size={14} />
                    }
                  </button>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
