import { useNavigate, useLocation } from 'react-router-dom'
import { Home, BookOpen, Trophy, User, Newspaper, Settings } from 'lucide-react'
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
    { path: '/admin', icon: Home, label: 'Bosh' },
    { path: '/admin/users', icon: User, label: 'Users' },
    { path: '/admin/modules', icon: BookOpen, label: 'Modullar' },
    { path: '/admin/payments', icon: Settings, label: "To'lovlar" }
  ]
  
  const isAdmin = location.pathname.startsWith('/admin')
  const tabs = isAdmin ? adminTabs : userTabs
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-lg border-t border-slate-700 z-40">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all ${
                isActive 
                  ? 'text-blue-500' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={22} className={isActive ? 'mb-1' : 'mb-1'} />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute top-0 w-12 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
      
      {/* Admin switch */}
      {user?.is_admin && (
        <button
          onClick={() => navigate(isAdmin ? '/' : '/admin')}
          className="absolute -top-10 right-4 bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs"
        >
          {isAdmin ? '← User' : 'Admin →'}
        </button>
      )}
    </div>
  )
}
