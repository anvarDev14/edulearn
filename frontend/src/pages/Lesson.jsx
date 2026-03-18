import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Zap, Play, CheckCircle } from 'lucide-react'
import { lessonsAPI } from '../api'
import Loader from '../components/common/Loader'

export default function Lesson() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    loadLesson()
  }, [lessonId])

  const loadLesson = async () => {
    try {
      const res = await lessonsAPI.getLesson(lessonId)
      setLesson(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getEmbedUrl = (url) => {
    if (!url) return null

    // youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }

    // youtu.be/VIDEO_ID
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }

    // Agar allaqachon embed bo'lsa
    if (url.includes('youtube.com/embed')) {
      return url
    }

    return url
  }

  const completeLesson = async () => {
    if (lesson?.is_completed) return
    setCompleting(true)
    try {
      await lessonsAPI.completeLesson(lessonId)
      setLesson({ ...lesson, is_completed: true })
      alert(`Tabriklaymiz! +${lesson.xp_reward} XP oldingiz!`)
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    } finally {
      setCompleting(false)
    }
  }

  if (loading) return <Loader />

  if (!lesson) {
    return (
      <div className="page">
        <div className="empty">
          <span className="empty-icon emoji-soft">📼</span>
          <p className="empty-title">Dars topilmadi</p>
          <p className="empty-desc">Ehtimol havola o‘zgargan yoki dars o‘chirib tashlangan.</p>
        </div>
      </div>
    )
  }

  const embedUrl = getEmbedUrl(lesson.video_url)

  return (
    <div className="page">
      {/* Header */}
      <header className="page-header" style={{ marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={16} />
          Ortga
        </button>
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ fontSize: 18 }}>{lesson.title}</h1>
          <p className="page-subtitle" style={{ marginTop: 4 }}>{lesson.description}</p>
        </div>
      </header>

      {/* Video Player */}
      <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 16 }}>
        {embedUrl ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', background: 'black' }}>
            <iframe
              src={embedUrl}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={lesson.title}
            />
          </div>
        ) : (
          <div style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617' }}>
            <div style={{ textAlign: 'center' }}>
              <div
                className="emoji-soft"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  border: '1px solid var(--border2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: 32
                }}
              >
                <Play size={32} />
              </div>
              <p style={{ fontSize: 14, color: 'var(--text2)' }}>Video mavjud emas</p>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Info */}
      <div className="card card-sm" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--text3)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Clock size={16} /> {lesson.duration_min} daqiqa
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Zap size={16} style={{ color: 'var(--gold)' }} /> {lesson.xp_reward} XP
          </span>
        </div>
      </div>

      {/* Content */}
      {lesson.content && (
        <div className="card" style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>📝 Dars matni</h3>
          <p
            style={{
              fontSize: 14,
              color: 'var(--text2)',
              whiteSpace: 'pre-line',
              lineHeight: 1.6
            }}
          >
            {lesson.content}
          </p>
        </div>
      )}

      {/* Complete / Quiz buttons */}
      {!lesson.is_completed ? (
        <button
          type="button"
          onClick={completeLesson}
          disabled={completing}
          className="btn btn-primary btn-full btn-lg"
          style={{ marginTop: 4 }}
        >
          <CheckCircle size={18} />
          {completing ? 'Yuklanmoqda...' : `Tugatish va ${lesson.xp_reward} XP olish`}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <button
            type="button"
            className="btn btn-full btn-lg"
            style={{ background: 'var(--green-dim)', color: 'var(--green)' }}
            disabled
          >
            <CheckCircle size={18} />
            Tugatilgan
          </button>

          {lesson.has_quiz && (
            <button
              type="button"
              onClick={() => navigate(`/quiz/${lesson.quiz_id}`)}
              className="btn btn-secondary btn-full btn-lg"
            >
              📝 Quizni boshlash
            </button>
          )}
        </div>
      )}
    </div>
  )
}