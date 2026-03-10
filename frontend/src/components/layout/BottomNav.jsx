import { useNavigate, useLocation } from 'react-router-dom'
import { Home, BookOpen, Trophy, User, Newspaper, Users, CreditCard, HelpCircle, Settings, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const userTabs = [
    { path: '/', icon: Home, label: 'Bosh' },
    { path: '/modules', icon: BookOpen, label: 'Darslar' },
    { path: '/leaderboard', icon: Trophy, label: 'Reyting' },
    { path: '/news', icon: Newspaper, label: 'Yangilik' },
    { path: '/profile', icon: User, label: 'Profil' }
  ]

  const adminTabs = [
    { path: '/admin', icon: Home, label: 'Bosh', exact: true },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/modules', icon: BookOpen, label: 'Modullar' },
    { path: '/admin/quizzes', icon: HelpCircle, label: 'Quiz' },
    { path: '/admin/payments', icon: CreditCard, label: "To'lov" },
    { path: '/admin/settings', icon: Settings, label: 'Sozlama' }
  ]

  const isAdminPage = location.pathname.startsWith('/admin')
  const tabs = isAdminPage ? adminTabs : userTabs

  const isActive = (tab) => {
    if (tab.exact) {
      return location.pathname === tab.path
    }
    if (tab.path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(tab.path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-lg border-t border-slate-700 z-50">
      <div className={`flex justify-around items-center h-16 max-w-lg mx-auto ${isAdminPage ? 'px-1' : 'px-2'}`}>
        {tabs.map(tab => {
          const Icon = tab.icon
          const active = isActive(tab)

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all relative ${
                active
                  ? 'text-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {active && (
                <div className="absolute top-0 w-10 h-0.5 bg-blue-500 rounded-full" />
              )}
              <Icon size={isAdminPage ? 18 : 22} className="mb-1" />
              <span className={`font-medium ${isAdminPage ? 'text-[10px]' : 'text-xs'}`}>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Admin/User switch button */}
      {user?.is_admin && (
        <button
          onClick={() => navigate(isAdminPage ? '/' : '/admin')}
          className="absolute -top-12 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg flex items-center gap-2 hover:from-blue-500 hover:to-indigo-500 transition-all"
        >
          <Shield size={14} />
          {isAdminPage ? 'User Mode' : 'Admin Mode'}
        </button>
      )}
    </div>
  )
}
