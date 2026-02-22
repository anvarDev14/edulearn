import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Play, CheckCircle, Crown } from 'lucide-react'
import { lessonsAPI } from '../api'
import Loader from '../components/common/Loader'

export default function ModuleLessons() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadLessons()
  }, [moduleId])
  
  const loadLessons = async () => {
    try {
      const res = await lessonsAPI.getModuleLessons(moduleId)
      setData(res.data)
    } catch (error) {
      console.error('Error:', error)
      if (error.response?.status === 403) {
        navigate('/premium')
      }
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <Loader />
  if (!data) return null
  
  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{data.module.emoji}</span>
        <h1 className="text-2xl font-bold">{data.module.title}</h1>
      </div>
      
      <div className="space-y-3">
        {data.lessons.map((lesson, i) => (
          <motion.div
            key={lesson.id}
            onClick={() => !lesson.is_locked && navigate(`/lesson/${lesson.id}`)}
            className={`bg-slate-800 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition ${
              lesson.is_locked ? 'opacity-60' : 'hover:bg-slate-700'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              lesson.is_completed ? 'bg-green-500' :
              lesson.is_locked ? 'bg-slate-700' : 'bg-blue-500'
            }`}>
              {lesson.is_completed ? <CheckCircle size={20} /> :
               lesson.is_locked ? <Lock size={18} /> : <Play size={18} />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{lesson.title}</h3>
                {lesson.is_premium && <Crown size={14} className="text-amber-500" />}
              </div>
              <p className="text-slate-400 text-sm">
                {lesson.duration_min} daqiqa • {lesson.xp_reward} XP
              </p>
            </div>
            
            {lesson.has_quiz && (
              <div className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                Quiz
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
