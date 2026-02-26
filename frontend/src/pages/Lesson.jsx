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
      <div className="p-4 text-center text-red-500">
        Dars topilmadi
      </div>
    )
  }

  const embedUrl = getEmbedUrl(lesson.video_url)

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-slate-800 p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-white">{lesson.title}</h1>
          <p className="text-slate-400 text-sm">{lesson.description}</p>
        </div>
      </div>

      {/* Video Player */}
      {embedUrl ? (
        <div className="aspect-video bg-black">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={lesson.title}
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play size={40} className="text-white ml-1" />
            </div>
            <p className="text-white/60">Video mavjud emas</p>
          </div>
        </div>
      )}

      {/* Lesson Info */}
      <div className="p-4">
        <div className="flex items-center gap-4 text-slate-400 text-sm mb-4">
          <span className="flex items-center gap-1">
            <Clock size={16} /> {lesson.duration_min} daqiqa
          </span>
          <span className="flex items-center gap-1">
            <Zap size={16} className="text-yellow-500" /> {lesson.xp_reward} XP
          </span>
        </div>

        {/* Content */}
        {lesson.content && (
          <div className="bg-slate-800 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-white mb-3">📝 Dars matni</h3>
            <p className="text-slate-300 whitespace-pre-line leading-relaxed">
              {lesson.content}
            </p>
          </div>
        )}

        {/* Complete Button */}
        {!lesson.is_completed ? (
          <button
            onClick={completeLesson}
            disabled={completing}
            className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50"
          >
            {completing ? 'Yuklanmoqda...' : (
              <>
                <CheckCircle size={20} />
                Tugatish va {lesson.xp_reward} XP olish
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <button
              className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-green-500 text-white"
              disabled
            >
              <CheckCircle size={20} />
              Tugatilgan ✓
            </button>

            {lesson.has_quiz && (
              <button
                onClick={() => navigate(`/quiz/${lesson.quiz_id}`)}
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-purple-500 text-white"
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