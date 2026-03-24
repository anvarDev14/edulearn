import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Crown, Lock, CheckCircle, ChevronRight, Headphones, BookOpen, Video } from 'lucide-react'
import { lessonsAPI, audioAPI, booksAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/common/Loader'

const TABS = [
  { key: 'video', label: 'Video Kurslar', icon: '🎬' },
  { key: 'audio', label: 'Audio', icon: '🎧' },
  { key: 'books', label: 'Kitoblar', icon: '📚' },
]

export default function Modules() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()

  const initTab = searchParams.get('tab') || 'video'
  const [tab, setTab] = useState(initTab)

  const [modules, setModules] = useState([])
  const [audioCategories, setAudioCategories] = useState([])
  const [bookCategories, setBookCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (tab === 'video') {
      lessonsAPI.getModules()
        .then(r => setModules(r.data))
        .finally(() => setLoading(false))
    } else if (tab === 'audio') {
      audioAPI.getCategories()
        .then(r => setAudioCategories(r.data))
        .finally(() => setLoading(false))
    } else {
      booksAPI.getCategories()
        .then(r => setBookCategories(r.data))
        .finally(() => setLoading(false))
    }
  }, [tab])

  const switchTab = (key) => {
    setTab(key)
    setSearchParams({ tab: key })
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 2 }}>
          Ta'lim
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Kurslar</h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 20,
        background: 'var(--bg2)', borderRadius: 14, padding: 4,
        border: '1px solid var(--border)'
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 11, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 12, transition: 'all 0.18s',
              background: tab === t.key ? 'var(--surface)' : 'transparent',
              color: tab === t.key ? 'var(--primary)' : 'var(--text3)',
              boxShadow: tab === t.key ? '0 1px 6px rgba(0,0,0,0.07)' : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : (
        <>
          {/* VIDEO tab */}
          {tab === 'video' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {modules.map(module => {
                const progress = module.progress || 0
                const locked = module.is_premium && !user?.is_premium
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => !locked && navigate(`/modules/${module.id}`)}
                    className="card card-sm"
                    style={{ opacity: locked ? 0.6 : 1, cursor: locked ? 'not-allowed' : 'pointer', textAlign: 'left', padding: 16 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 26 }}>{module.emoji || '📖'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 600 }}>{module.title}</h3>
                          {module.is_premium && <Crown size={13} style={{ color: 'var(--gold)' }} />}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
                          {module.total_lessons || 0} ta dars
                        </p>
                        {!locked && module.total_lessons > 0 && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
                              <span>{progress}% tugatildi</span>
                              {progress === 100 && <span style={{ color: 'var(--green)', display: 'flex', gap: 3, alignItems: 'center' }}><CheckCircle size={10} /> Tugatildi</span>}
                            </div>
                            <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
                          </div>
                        )}
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                    </div>
                  </button>
                )
              })}
              {modules.length === 0 && (
                <div className="empty">
                  <span className="empty-icon">🎬</span>
                  <p className="empty-title">Video kurslar yo'q</p>
                </div>
              )}
              {!user?.is_premium && modules.some(m => m.is_premium) && (
                <button onClick={() => navigate('/premium')} className="btn btn-secondary btn-full" style={{ marginTop: 8 }}>
                  <Crown size={16} /> Premium imkoniyatlar
                </button>
              )}
            </div>
          )}

          {/* AUDIO tab */}
          {tab === 'audio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {audioCategories.map(cat => (
                <div
                  key={cat.id}
                  className="card"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}
                  onClick={() => navigate(`/audio/${cat.id}`)}
                >
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {cat.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{cat.title}</p>
                    {cat.description && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{cat.description}</p>}
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text3)' }} />
                </div>
              ))}
              {audioCategories.length === 0 && (
                <div className="empty">
                  <span className="empty-icon">🎧</span>
                  <p className="empty-title">Audio darsliklar yo'q</p>
                </div>
              )}
            </div>
          )}

          {/* BOOKS tab */}
          {tab === 'books' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bookCategories.map(cat => (
                <div
                  key={cat.id}
                  className="card"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}
                  onClick={() => navigate(`/books/${cat.id}`)}
                >
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {cat.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{cat.title}</p>
                    {cat.description && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{cat.description}</p>}
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text3)' }} />
                </div>
              ))}
              {bookCategories.length === 0 && (
                <div className="empty">
                  <span className="empty-icon">📚</span>
                  <p className="empty-title">Elektron kitoblar yo'q</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
