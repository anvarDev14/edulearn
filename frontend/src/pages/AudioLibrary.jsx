import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Headphones, ChevronRight, Crown, Clock } from 'lucide-react'
import { audioAPI } from '../api'

export default function AudioLibrary() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    audioAPI.getCategories()
      .then(r => setCategories(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loader-full"><div className="spinner" /></div>

  return (
    <div className="page">
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
          Kutubxona
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
          🎧 Audio Darsliklar
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
          Quloq solib o'rganing
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <Headphones size={40} style={{ color: 'var(--text3)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Hozircha audio yo'q</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {categories.map(cat => (
            <div
              key={cat.id}
              className="card"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}
              onClick={() => navigate(`/audio/${cat.id}`)}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 14,
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
              <ChevronRight size={16} style={{ color: 'var(--text3)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
