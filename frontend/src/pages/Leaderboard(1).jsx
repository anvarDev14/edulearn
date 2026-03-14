import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal } from 'lucide-react'
import { leaderboardAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/common/Loader'

export default function Leaderboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('global')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadData()
  }, [tab])
  
  const loadData = async () => {
    setLoading(true)
    try {
      const res = tab === 'global' 
        ? await leaderboardAPI.getGlobal(20)
        : await leaderboardAPI.getWeekly(20)
      setData(res.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={20} className="text-yellow-500" />
    if (rank === 2) return <Medal size={20} className="text-slate-300" />
    if (rank === 3) return <Medal size={20} className="text-amber-600" />
    return <span className="text-slate-400 font-bold w-5 text-center">{rank}</span>
  }
  
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">🏆 Reyting</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('global')}
          className={`flex-1 py-2 rounded-xl font-medium transition ${
            tab === 'global' ? 'bg-blue-500' : 'bg-slate-800'
          }`}
        >
          Umumiy
        </button>
        <button
          onClick={() => setTab('weekly')}
          className={`flex-1 py-2 rounded-xl font-medium transition ${
            tab === 'weekly' ? 'bg-blue-500' : 'bg-slate-800'
          }`}
        >
          Haftalik
        </button>
      </div>
      
      {loading ? <Loader /> : (
        <div className="space-y-3">
          {data?.leaderboard.map((item, i) => (
            <motion.div
              key={item.user_id}
              className={`bg-slate-800 rounded-xl p-4 flex items-center gap-3 ${
                item.is_current_user ? 'ring-2 ring-blue-500' : ''
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(item.rank)}
              </div>
              
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-lg">
                {item.level_badge}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.full_name}</span>
                  {item.is_premium && <Crown size={14} className="text-amber-500" />}
                </div>
                <p className="text-slate-400 text-sm">Level {item.level}</p>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-blue-400">
                  {(tab === 'weekly' ? item.weekly_xp : item.total_xp).toLocaleString()}
                </p>
                <p className="text-slate-400 text-xs">XP</p>
              </div>
            </motion.div>
          ))}
          
          {/* Current user if not in top */}
          {data?.current_user && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Sizning o'rningiz</p>
              <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3 ring-2 ring-blue-500">
                <span className="text-slate-400 font-bold">#{data.current_user.rank}</span>
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-lg">
                  {data.current_user.level_badge}
                </div>
                <div className="flex-1">
                  <span className="font-semibold">{user?.full_name}</span>
                  <p className="text-slate-400 text-sm">Level {data.current_user.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-400">{data.current_user.total_xp.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs">XP</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
