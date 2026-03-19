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

  const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'))

  const getEmbedUrl = (url) => {
    if (!url) return null
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  const getLocalVideoUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    const base = import.meta.env.VITE_API_URL?.replace('/api', '') || ''
    return `${base}/${url}`
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
      <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>📭</p>
        <p style={{ color: 'var(--text3)' }}>Dars topilmadi</p>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--text)' }} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lesson.title}
          </h1>
          {lesson.description && (
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lesson.description}
            </p>
          )}
        </div>
      </div>

      {/* Video */}
      {lesson.video_url ? (
        isYouTube(lesson.video_url) ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
            <iframe
              src={getEmbedUrl(lesson.video_url)}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={lesson.title}
            />
          </div>
        ) : (
          <div style={{ background: '#000' }}>
            <video
              src={getLocalVideoUrl(lesson.video_url)}
              controls
              style={{ width: '100%', maxHeight: 320, display: 'block' }}
            />
          </div>
        )
      ) : (
        <div style={{
          position: 'relative', paddingBottom: '56.25%',
          background: 'linear-gradient(135deg, var(--bg2), var(--surface))'
        }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={30} style={{ color: 'var(--primary)', marginLeft: 3 }} />
            </div>
            <p style={{ color: 'var(--text3)', fontSize: 13 }}>Video mavjud emas</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text3)' }}>
            <Clock size={14} /> {lesson.duration_min} daqiqa
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--gold)' }}>
            <Zap size={14} /> {lesson.xp_reward} XP
          </span>
        </div>

        {lesson.content && (
          <div className="card" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>📝 Dars matni</p>
            <p style={{ fontSize: 14, color: 'var(--text2)', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
              {lesson.content}
            </p>
          </div>
        )}

        {!lesson.is_completed ? (
          <button
            onClick={completeLesson}
            disabled={completing}
            className="btn btn-primary btn-full btn-lg"
          >
            {completing ? 'Yuklanmoqda...' : (
              <><CheckCircle size={18} /> Tugatish · +{lesson.xp_reward} XP</>
            )}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-full btn-lg" disabled style={{ background: 'var(--green-dim)', color: 'var(--green)', cursor: 'default' }}>
              <CheckCircle size={18} /> Tugatilgan ✓
            </button>
            {lesson.has_quiz && (
              <button
                onClick={() => navigate(`/quiz/${lesson.quiz_id}`)}
                className="btn btn-full btn-lg btn-gold"
              >
                📝 Quizni boshlash
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
