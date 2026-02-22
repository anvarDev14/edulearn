import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Crown } from 'lucide-react'
import { lessonsAPI } from '../api'
import Loader from '../components/common/Loader'

export default function Modules() {
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadModules()
  }, [])
  
  const loadModules = async () => {
    try {
      const res = await lessonsAPI.getModules()
      setModules(res.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <Loader />
  
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">📚 Modullar</h1>
      
      <div className="space-y-4">
        {modules.map((module, i) => (
          <motion.div
            key={module.id}
            onClick={() => !module.is_locked && navigate(`/modules/${module.id}`)}
            className={`bg-slate-800 rounded-2xl p-5 cursor-pointer transition ${
              module.is_locked ? 'opacity-60' : 'hover:bg-slate-700'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{module.emoji}</div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg">{module.title}</h2>
                  {module.is_premium && (
                    <Crown size={16} className="text-amber-500" />
                  )}
                </div>
                
                {module.description && (
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                    {module.description}
                  </p>
                )}
                
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400">
                      {module.completed_lessons}/{module.total_lessons} dars
                    </span>
                    <span className="text-blue-400">{module.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${module.progress}%` }}
                      transition={{ duration: 0.5, delay: 0.2 * i }}
                    />
                  </div>
                </div>
              </div>
              
              {module.is_locked && (
                <div className="flex items-center justify-center w-10 h-10 bg-slate-700 rounded-full">
                  <Lock size={18} className="text-amber-500" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {modules.length === 0 && (
        <div className="text-center py-12">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-slate-400">Hozircha modullar yo'q</p>
        </div>
      )}
    </div>
  )
}
