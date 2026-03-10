import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Trophy, Zap, ChevronRight, Crown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { gamificationAPI, lessonsAPI, newsAPI } from '../api'
import XPBar from '../components/gamification/XPBar'
import Loader from '../components/common/Loader'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t, isDark } = useTheme()
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

  const cardClass = isDark ? 'bg-slate-800' : 'bg-white shadow-sm'
  const textClass = isDark ? 'text-white' : 'text-slate-800'
  const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500'

  if (loading) return <Loader />

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${textClass}`}>
            {t('home.welcome')}, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className={subTextClass + " text-sm"}>{t('home.startLearning')}</p>
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
          className={`${cardClass} rounded-xl p-3 text-center`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <BookOpen className="mx-auto text-blue-500 mb-1" size={20} />
          <p className={`text-xl font-bold ${textClass}`}>{stats?.stats.completed_lessons || 0}</p>
          <p className={`text-xs ${subTextClass}`}>{t('nav.lessons')}</p>
        </motion.div>

        <motion.div
          className={`${cardClass} rounded-xl p-3 text-center`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Zap className="mx-auto text-yellow-500 mb-1" size={20} />
          <p className={`text-xl font-bold ${textClass}`}>{stats?.stats.streak_days || 0}</p>
          <p className={`text-xs ${subTextClass}`}>Streak</p>
        </motion.div>

        <motion.div
          className={`${cardClass} rounded-xl p-3 text-center`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Trophy className="mx-auto text-purple-500 mb-1" size={20} />
          <p className={`text-xl font-bold ${textClass}`}>{stats?.stats.weekly_xp || 0}</p>
          <p className={`text-xs ${subTextClass}`}>XP</p>
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
              <p className="font-bold text-white">{t('home.dailyChallenge')}</p>
              <p className="text-sm text-green-100">+25 XP</p>
            </div>
            <ChevronRight className="text-white" />
          </div>
        </motion.button>
      )}

      {/* Continue Learning */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className={`font-bold text-lg ${textClass}`}>{t('home.continue')}</h2>
          <button
            onClick={() => navigate('/modules')}
            className="text-blue-500 text-sm"
          >
            {t('modules.title')} →
          </button>
        </div>

        <div className="space-y-3">
          {modules.map((module, i) => (
            <motion.div
              key={module.id}
              onClick={() => navigate(`/modules/${module.id}`)}
              className={`${cardClass} rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:opacity-80 transition`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <div className="text-3xl">{module.emoji}</div>
              <div className="flex-1">
                <h3 className={`font-semibold ${textClass}`}>{module.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                  <span className={`text-xs ${subTextClass}`}>{module.progress}%</span>
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
            <h2 className={`font-bold text-lg ${textClass}`}>{t('news.title')}</h2>
            <button
              onClick={() => navigate('/news')}
              className="text-blue-500 text-sm"
            >
              {t('modules.title')} →
            </button>
          </div>

          <div className="space-y-3">
            {news.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(`/news`)}
                className={`${cardClass} rounded-xl p-4 cursor-pointer hover:opacity-80 transition`}
              >
                <h3 className={`font-semibold mb-1 ${textClass}`}>{item.title}</h3>
                <p className={`text-sm line-clamp-2 ${subTextClass}`}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
