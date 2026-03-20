import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Headphones, BookOpen, ChevronRight } from 'lucide-react'
import { audioAPI, booksAPI } from '../api'

export default function Library() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'books' ? 'books' : 'audio')
  const [audioCategories, setAudioCategories] = useState([])
  const [bookCategories, setBookCategories] = useState([])
  const [loadingAudio, setLoadingAudio] = useState(true)
  const [loadingBooks, setLoadingBooks] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    audioAPI.getCategories()
      .then(r => setAudioCategories(r.data))
      .finally(() => setLoadingAudio(false))
    booksAPI.getCategories()
      .then(r => setBookCategories(r.data))
      .finally(() => setLoadingBooks(false))
  }, [])

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 2 }}>
          Kontent
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Kutubxona</h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 20,
        background: 'var(--bg2)', borderRadius: 14, padding: 5,
        border: '1px solid var(--border)'
      }}>
        {[
          { key: 'audio', label: '🎧 Audio', icon: Headphones },
          { key: 'books', label: '📚 Kitoblar', icon: BookOpen },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 14, transition: 'all 0.18s',
              background: tab === t.key ? 'var(--surface)' : 'transparent',
              color: tab === t.key ? 'var(--primary)' : 'var(--text3)',
              boxShadow: tab === t.key ? '0 1px 6px rgba(0,0,0,0.07)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Audio tab */}
      {tab === 'audio' && (
        <div>
          {loadingAudio ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" />
            </div>
          ) : audioCategories.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <Headphones size={40} style={{ color: 'var(--text3)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text3)', fontSize: 14 }}>Hozircha audio yo'q</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {audioCategories.map(cat => (
                <div
                  key={cat.id}
                  className="card"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}
                  onClick={() => navigate(`/audio/${cat.id}`)}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: 'var(--primary-dim)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, flexShrink: 0
                  }}>
                    {cat.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{cat.title}</p>
                    {cat.description && (
                      <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{cat.description}</p>
                    )}
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Books tab */}
      {tab === 'books' && (
        <div>
          {loadingBooks ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" />
            </div>
          ) : bookCategories.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <BookOpen size={40} style={{ color: 'var(--text3)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text3)', fontSize: 14 }}>Hozircha kitob yo'q</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bookCategories.map(cat => (
                <div
                  key={cat.id}
                  className="card"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}
                  onClick={() => navigate(`/books/${cat.id}`)}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: 'var(--accent-dim)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, flexShrink: 0
                  }}>
                    {cat.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{cat.title}</p>
                    {cat.description && (
                      <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{cat.description}</p>
                    )}
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
