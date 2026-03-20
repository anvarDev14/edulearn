import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Crown, Clock, Headphones } from 'lucide-react'
import { audioAPI, getMediaUrl } from '../api'
import { useAuth } from '../context/AuthContext'

export default function AudioCategory() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    audioAPI.getCategoryAudios(categoryId)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [categoryId])

  if (loading) return <div className="loader-full"><div className="spinner" /></div>
  if (!data) return null

  const { category, audios } = data

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => navigate('/audio')}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px 12px' }}
        >
          ← Orqaga
        </button>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
            {category.emoji} {category.title}
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Audio Darslar</h1>
        </div>
      </div>

      {audios.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <Headphones size={40} style={{ color: 'var(--text3)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Bu kategoriyada hozircha audio yo'q</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {audios.map((audio, idx) => {
            const locked = audio.is_premium && !user?.is_premium
            return (
              <div
                key={audio.id}
                className="card"
                style={{
                  cursor: locked ? 'default' : 'pointer',
                  opacity: locked ? 0.85 : 1,
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px'
                }}
                onClick={() => !locked && navigate(`/audio/player/${audio.id}`)}
              >
                {/* Cover or number */}
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: audio.cover_url ? 'transparent' : 'var(--primary-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, overflow: 'hidden'
                }}>
                  {audio.cover_url
                    ? <img src={getMediaUrl(audio.cover_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 16 }}>{idx + 1}</span>
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {audio.title}
                    </p>
                    {audio.is_premium && (
                      <Crown size={12} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3 }}>
                    {audio.author && (
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{audio.author}</span>
                    )}
                    {audio.duration_str && (
                      <span style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} />
                        {audio.duration_str}
                      </span>
                    )}
                  </div>
                </div>

                {locked ? (
                  <div style={{
                    background: 'var(--gold-dim)', borderRadius: 8, padding: '4px 8px',
                    display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0
                  }}>
                    <Crown size={12} style={{ color: 'var(--gold)' }} />
                    <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>Premium</span>
                  </div>
                ) : (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--primary-dim)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <span style={{ fontSize: 14 }}>▶</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
