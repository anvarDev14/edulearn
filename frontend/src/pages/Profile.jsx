import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Crown, Settings, Zap, BookOpen, Trophy, Calendar } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { gamificationAPI } from '../api'
import XPBar from '../components/gamification/XPBar'
import Loader from '../components/common/Loader'

export default function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [xpHistory, setXPHistory] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        gamificationAPI.getStats(),
        gamificationAPI.getXPHistory(10)
      ])
      setStats(statsRes.data)
      setXPHistory(historyRes.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <Loader />
  
  return (
    <div className="min-h-screen p-4">
      {/* Profile Header */}
      <div className="bg-slate-800 rounded-2xl p-6 text-center mb-6">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center text-4xl">
            {stats?.level.badge || '🌱'}
          </div>
          {user?.is_premium && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-2">
              <Crown size={16} />
            </div>
          )}
        </div>
        
        <h1 className="text-xl font-bold">{user?.full_name}</h1>
        {user?.username && (
          <p className="text-slate-400">@{user.username}</p>
        )}
        
        <div className="flex justify-center gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats?.level.level}</p>
            <p className="text-slate-400 text-xs">Level</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats?.level.total_xp.toLocaleString()}</p>
            <p className="text-slate-400 text-xs">XP</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats?.stats.streak_days}</p>
            <p className="text-slate-400 text-xs">Streak</p>
          </div>
        </div>
      </div>
      
      {/* XP Progress */}
      {stats && (
        <XPBar 
          totalXP={stats.level.total_xp}
          level={stats.level.level}
          progress={stats.level.progress}
          xpToNext={stats.level.xp_to_next}
          badge={stats.level.badge}
        />
      )}
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 my-6">
        {!user?.is_premium && (
          <motion.button
            onClick={() => navigate('/premium')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-left"
            whileHover={{ scale: 1.02 }}
          >
            <Crown size={24} className="mb-2" />
            <p className="font-bold">Premium</p>
            <p className="text-xs opacity-80">Barcha darslar</p>
          </motion.button>
        )}
        
        <motion.button
          onClick={() => navigate('/settings')}
          className="bg-slate-800 rounded-xl p-4 text-left"
          whileHover={{ scale: 1.02 }}
        >
          <Settings size={24} className="mb-2 text-slate-400" />
          <p className="font-bold">Sozlamalar</p>
          <p className="text-xs text-slate-400">Profil, til</p>
        </motion.button>
      </div>
      
      {/* Stats */}
      <div className="bg-slate-800 rounded-2xl p-4 mb-6">
        <h3 className="font-bold mb-4">📊 Statistika</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="font-bold">{stats?.stats.completed_lessons}</p>
              <p className="text-slate-400 text-xs">Darslar</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-yellow-500" />
            </div>
            <div>
              <p className="font-bold">{stats?.stats.weekly_xp}</p>
              <p className="text-slate-400 text-xs">Hafta XP</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* XP History */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <h3 className="font-bold mb-4">📜 XP Tarixi</h3>
        <div className="space-y-3">
          {xpHistory.map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm">{item.description}</p>
                <p className="text-slate-400 text-xs">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className="text-green-400 font-bold">+{item.amount}</span>
            </div>
          ))}
          
          {xpHistory.length === 0 && (
            <p className="text-slate-400 text-center py-4">Hali XP yig'ilmagan</p>
          )}
        </div>
      </div>
    </div>
  )
}
