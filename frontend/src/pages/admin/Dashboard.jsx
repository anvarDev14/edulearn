import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, BookOpen, CreditCard, TrendingUp, Home, HelpCircle, Settings } from 'lucide-react'
import { adminAPI } from '../../api'
import Loader from '../../components/common/Loader'

// Admin Bottom Navigation
function AdminBottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { path: '/admin', icon: Home, label: 'Bosh' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/modules', icon: BookOpen, label: 'Modullar' },
    { path: '/admin/quizzes', icon: HelpCircle, label: 'Quiz' },
    { path: '/admin/payments', icon: CreditCard, label: "To'lov" },
    { path: '/admin/settings', icon: Settings, label: 'Sozlama' },
  ]

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur border-t border-slate-700 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          const active = isActive(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all ${
                active ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              <Icon size={18} />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

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
    <div className="min-h-screen p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">🎛️ Admin Panel</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          onClick={() => navigate('/admin/users')}
          className="bg-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-700 transition"
          whileHover={{ scale: 1.02 }}
        >
          <Users className="text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.users?.total || 0}</p>
          <p className="text-slate-400 text-sm">Foydalanuvchilar</p>
        </motion.div>

        <div className="bg-slate-800 rounded-xl p-4">
          <Users className="text-amber-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.users?.premium || 0}</p>
          <p className="text-slate-400 text-sm">Premium</p>
        </div>

        <motion.div
          onClick={() => navigate('/admin/modules')}
          className="bg-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-700 transition"
          whileHover={{ scale: 1.02 }}
        >
          <BookOpen className="text-green-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.content?.modules || 0}</p>
          <p className="text-slate-400 text-sm">Modullar</p>
        </motion.div>

        <motion.div
          onClick={() => navigate('/admin/payments')}
          className="bg-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-700 transition"
          whileHover={{ scale: 1.02 }}
        >
          <CreditCard className="text-purple-500 mb-2" />
          <p className="text-2xl font-bold">{stats?.payments?.pending || 0}</p>
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
          {(stats?.payments?.total_revenue || 0).toLocaleString()} so'm
        </p>
      </div>

      {/* Quick Stats */}
      <div className="bg-slate-800 rounded-xl p-4">
        <h3 className="font-bold mb-4">📊 Bugun</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Faol foydalanuvchilar</span>
            <span className="font-bold">{stats?.users?.active_today || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Darslar</span>
            <span className="font-bold">{stats?.content?.lessons || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Quizlar</span>
            <span className="font-bold">{stats?.content?.quizzes || 0}</span>
          </div>
        </div>
      </div>

      {/* Admin Bottom Nav */}
      <AdminBottomNav />
    </div>
  )
}

// Export AdminBottomNav for other admin pages
export { AdminBottomNav }