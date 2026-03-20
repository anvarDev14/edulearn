import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, Pause, SkipBack, SkipForward, Volume2, Crown } from 'lucide-react'
import { audioAPI, getMediaUrl } from '../api'

export default function AudioPlayer() {
  const { audioId } = useParams()
  const navigate = useNavigate()
  const [audio, setAudio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    audioAPI.getAudio(audioId)
      .then(r => setAudio(r.data))
      .catch(err => {
        if (err.response?.status === 403) {
          setError('premium')
        } else {
          setError('notfound')
        }
      })
      .finally(() => setLoading(false))
  }, [audioId])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  const seek = (e) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = x / rect.width
    const newTime = ratio * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading) return <div className="loader-full"><div className="spinner" /></div>

  if (error === 'premium') {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Crown size={48} style={{ color: 'var(--gold)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Premium Kontent</h2>
        <p style={{ color: 'var(--text3)', textAlign: 'center', marginBottom: 24 }}>
          Bu audio faqat premium foydalanuvchilar uchun
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/premium')}>
          Premium olish
        </button>
        <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => navigate(-1)}>
          Orqaga
        </button>
      </div>
    )
  }

  if (!audio) return null

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="page">
      <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>
        ← Orqaga
      </button>

      {/* Cover */}
      <div style={{
        width: '100%', aspectRatio: '1', maxWidth: 300, margin: '0 auto 28px',
        borderRadius: 20, overflow: 'hidden',
        background: 'var(--primary-dim)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
      }}>
        {audio.cover_url
          ? <img src={getMediaUrl(audio.cover_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 80 }}>🎧</span>
        }
      </div>

      {/* Info */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>{audio.title}</h1>
        {audio.author && <p style={{ fontSize: 14, color: 'var(--text3)' }}>{audio.author}</p>}
        {audio.description && (
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 8, lineHeight: 1.5 }}>{audio.description}</p>
        )}
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={getMediaUrl(audio.audio_url)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
      />

      {/* Progress bar */}
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            height: 6, background: 'var(--border)', borderRadius: 3, cursor: 'pointer',
            position: 'relative', overflow: 'hidden'
          }}
          onClick={seek}
        >
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${progress}%`, background: 'var(--primary)', borderRadius: 3,
            transition: 'width 0.1s'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{formatTime(currentTime)}</span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 16 }}>
        <button
          onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 10) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 8 }}
        >
          <SkipBack size={28} />
        </button>

        <button
          onClick={togglePlay}
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--primary)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
          }}
        >
          {playing
            ? <Pause size={28} style={{ color: '#fff' }} />
            : <Play size={28} style={{ color: '#fff', marginLeft: 3 }} />
          }
        </button>

        <button
          onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.min(duration, currentTime + 10) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 8 }}
        >
          <SkipForward size={28} />
        </button>
      </div>

      {/* Speed hint */}
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 20 }}>
        ← 10 sek orqaga / 10 sek oldinga →
      </p>
    </div>
  )
}
