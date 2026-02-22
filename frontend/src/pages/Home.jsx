import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Trophy, Zap, ChevronRight, Crown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { gamificationAPI, lessonsAPI, newsAPI } from '../api'
import XPBar from '../components/gamification/XPBar'
import Loader from '../components/common/Loader'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [modules, setModules] = useState([])
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [dailyClaimed, setDailyClaimed] = useState(false)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const [statsRes, modulesRes, newsRes] = await Promise.all([
        gamificationAPI.getStats(),
        lessonsAPI.getModules(),
        newsAPI.getPinned()
      ])
      setStats(statsRes.data)
      setModules(modulesRes.data.slice(0, 3))
      setNews(newsRes.data.slice(0, 2))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const claimDaily = async () => {
    try {
      await gamificationAPI.claimDaily()
      setDailyClaimed(true)
      loadData()
    } catch (error) {
      if (error.response?.status === 400) {
        setDailyClaimed(true)
      }
    }
  }
  
  if (loading) return <Loader />
  
  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Salom, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm">Bugun nima o'rganamiz?</p>
        </div>
        
        {user?.is_premium && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-full flex items-center gap-1">
            <Crown size={14} />
            <span className="text-xs font-bold">PRO</span>
          </div>
        )}
      </div>
      
      {/* XP Bar */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <XPBar 
            totalXP={stats.level.total_xp}
            level={stats.level.level}
            progress={stats.level.progress}
            xpToNext={stats.level.xp_to_next}
            badge={stats.level.badge}
          />
        </motion.div>
      )}
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 my-6">
        <motion.div 
          className="bg-slate-800 rounded-xl p-3 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <BookOpen className="mx-auto text-blue-500 mb-1" size={20} />
          <p className="text-xl font-bold">{stats?.stats.completed_lessons || 0}</p>
          <p className="text-slate-400 text-xs">Darslar</p>
        </motion.div>
        
        <motion.div 
          className="bg-slate-800 rounded-xl p-3 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Zap className="mx-auto text-yellow-500 mb-1" size={20} />
          <p className="text-xl font-bold">{stats?.stats.streak_days || 0}</p>
          <p className="text-slate-400 text-xs">Streak</p>
        </motion.div>
        
        <motion.div 
          className="bg-slate-800 rounded-xl p-3 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Trophy className="mx-auto text-purple-500 mb-1" size={20} />
          <p className="text-xl font-bold">{stats?.stats.weekly_xp || 0}</p>
          <p className="text-slate-400 text-xs">Hafta XP</p>
        </motion.div>
      </div>
      
      {/* Daily Challenge */}
      {!dailyClaimed && (
        <motion.button
          onClick={claimDaily}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 mb-6 text-left"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">🎁 Kunlik bonus</p>
              <p className="text-sm text-green-100">+25 XP olish uchun bosing</p>
            </div>
            <ChevronRight />
          </div>
        </motion.button>
      )}
      
      {/* Continue Learning */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Davom eting</h2>
          <button 
            onClick={() => navigate('/modules')}
            className="text-blue-500 text-sm"
          >
            Barchasi →
          </button>
        </div>
        
        <div className="space-y-3">
          {modules.map((module, i) => (
            <motion.div
              key={module.id}
              onClick={() => navigate(`/modules/${module.id}`)}
              className="bg-slate-800 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-700 transition"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <div className="text-3xl">{module.emoji}</div>
              <div className="flex-1">
                <h3 className="font-semibold">{module.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                  <span className="text-slate-400 text-xs">{module.progress}%</span>
                </div>
              </div>
              {module.is_locked && (
                <div className="text-amber-500">🔒</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* News */}
      {news.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">📰 Yangiliklar</h2>
            <button 
              onClick={() => navigate('/news')}
              className="text-blue-500 text-sm"
            >
              Barchasi →
            </button>
          </div>
          
          <div className="space-y-3">
            {news.map(item => (
              <div 
                key={item.id}
                onClick={() => navigate(`/news`)}
                className="bg-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-700 transition"
              >
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-2">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
