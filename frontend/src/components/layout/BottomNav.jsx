import { useNavigate, useLocation } from 'react-router-dom'
import { Home, BookOpen, Trophy, User, Newspaper, Users, CreditCard, HelpCircle, Settings, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { isDark, t } = useTheme()

  const userTabs = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/modules', icon: BookOpen, label: t('nav.lessons') },
    { path: '/leaderboard', icon: Trophy, label: t('nav.rating') },
    { path: '/news', icon: Newspaper, label: t('nav.news') },
    { path: '/profile', icon: User, label: t('nav.profile') }
  ]

  const adminTabs = [
    { path: '/admin', icon: Home, label: t('nav.home'), exact: true },
    { path: '/admin/users', icon: Users, label: t('nav.users') },
    { path: '/admin/modules', icon: BookOpen, label: t('nav.modules') },
    { path: '/admin/quizzes', icon: HelpCircle, label: t('nav.quiz') },
    { path: '/admin/payments', icon: CreditCard, label: t('nav.payment') },
    { path: '/admin/settings', icon: Settings, label: t('nav.settings') }
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
    <div className={`fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t z-50 transition-colors ${
      isDark ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200'
    }`}>
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
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
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
