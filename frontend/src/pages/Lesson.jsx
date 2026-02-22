import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, CheckCircle, Clock, Zap } from 'lucide-react'
import { lessonsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import LevelUpModal from '../components/gamification/LevelUpModal'
import Loader from '../components/common/Loader'

export default function Lesson() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [levelUp, setLevelUp] = useState(null)
  
  useEffect(() => {
    loadLesson()
  }, [lessonId])
  
  const loadLesson = async () => {
    try {
      const res = await lessonsAPI.getLesson(lessonId)
      setLesson(res.data)
    } catch (error) {
      console.error('Error:', error)
      if (error.response?.status === 403) {
        navigate('/premium')
      }
    } finally {
      setLoading(false)
    }
  }
  
  const completeLesson = async () => {
    if (completing || lesson.is_completed) return
    setCompleting(true)
    
    try {
      const res = await lessonsAPI.completeLesson(lessonId)
      
      if (res.data.level_up) {
        setLevelUp({
          level: res.data.new_level,
          badge: res.data.level_info.badge
        })
      }
      
      updateUser({
        total_xp: res.data.total_xp,
        level: res.data.new_level
      })
      
      setLesson(prev => ({ ...prev, is_completed: true }))
      
      // Navigate to quiz if exists
      if (lesson.quiz_id) {
        setTimeout(() => navigate(`/quiz/${lesson.quiz_id}`), 1000)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setCompleting(false)
    }
  }
  
  if (loading) return <Loader />
  if (!lesson) return null
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-slate-800 p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={24} />
        </button>
        <div>
          <p className="text-slate-400 text-sm">{lesson.module.emoji} {lesson.module.title}</p>
          <h1 className="font-bold">{lesson.title}</h1>
        </div>
      </div>
      
      {/* Video */}
      {lesson.video_url && (
        <div className="aspect-video bg-black flex items-center justify-center">
          <iframe 
            src={lesson.video_url}
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-4 text-slate-400 text-sm mb-4">
          <span className="flex items-center gap-1">
            <Clock size={16} /> {lesson.duration_min} daqiqa
          </span>
          <span className="flex items-center gap-1">
            <Zap size={16} className="text-yellow-500" /> {lesson.xp_reward} XP
          </span>
        </div>
        
        {lesson.description && (
          <p className="text-slate-300 mb-4">{lesson.description}</p>
        )}
        
        {lesson.content && (
          <div className="prose prose-invert max-w-none mb-6">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
          </div>
        )}
        
        {/* Complete Button */}
        <motion.button
          onClick={completeLesson}
          disabled={completing || lesson.is_completed}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${
            lesson.is_completed 
              ? 'bg-green-500' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {lesson.is_completed ? (
            <>
              <CheckCircle size={20} />
              Tugatilgan
            </>
          ) : completing ? (
            'Yuklanmoqda...'
          ) : (
            <>
              <Play size={20} />
              {lesson.quiz_id ? 'Tugatish va Quiz' : 'Tugatish'} (+{lesson.xp_reward} XP)
            </>
          )}
        </motion.button>
      </div>
      
      {/* Level Up Modal */}
      <LevelUpModal 
        isOpen={!!levelUp}
        onClose={() => setLevelUp(null)}
        newLevel={levelUp?.level}
        badge={levelUp?.badge}
      />
    </div>
  )
}
