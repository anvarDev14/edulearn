import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, BookOpen, CreditCard, TrendingUp } from 'lucide-react'
import { adminAPI } from '../../api'
import Loader from '../../components/common/Loader'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadStats()
  }, [])
  
  const loadStats = async () => {
    try {
      const res = await adminAPI.getStats()
      setStats(res.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <Loader />
  
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">🎛️ Admin Panel</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          onClick={() => navigate('/admin/users')}
          className="bg-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-700 transition"
          whileHover={{ scale: 1.02 }}
        >
          <Users className="text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.users.total}</p>
          <p className="text-slate-400 text-sm">Foydalanuvchilar</p>
        </motion.div>
        
        <div className="bg-slate-800 rounded-xl p-4">
          <Users className="text-amber-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.users.premium}</p>
          <p className="text-slate-400 text-sm">Premium</p>
        </div>
        
        <motion.div
          onClick={() => navigate('/admin/modules')}
          className="bg-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-700 transition"
          whileHover={{ scale: 1.02 }}
        >
          <BookOpen className="text-green-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.content.modules}</p>
          <p className="text-slate-400 text-sm">Modullar</p>
        </motion.div>
        
        <motion.div
          onClick={() => navigate('/admin/payments')}
          className="bg-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-700 transition"
          whileHover={{ scale: 1.02 }}
        >
          <CreditCard className="text-purple-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.payments.pending}</p>
          <p className="text-slate-400 text-sm">Kutayotgan</p>
        </motion.div>
      </div>
      
      {/* Revenue */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp />
          <span className="font-medium">Jami daromad</span>
        </div>
        <p className="text-3xl font-bold">
          {stats?.payments.total_revenue?.toLocaleString()} so'm
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="bg-slate-800 rounded-xl p-4">
        <h3 className="font-bold mb-4">📊 Bugun</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Faol foydalanuvchilar</span>
            <span className="font-bold">{stats?.users.active_today}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Darslar</span>
            <span className="font-bold">{stats?.content.lessons}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Quizlar</span>
            <span className="font-bold">{stats?.content.quizzes}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
