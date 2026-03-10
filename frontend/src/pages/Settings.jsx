import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Bell, BellOff, LogOut, Crown, ChevronRight, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme, language, setLanguage } = useTheme()
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications')
    return saved !== null ? saved === 'true' : true
  })

  const isDark = theme === 'dark'

  useEffect(() => {
    localStorage.setItem('notifications', notifications.toString())
  }, [notifications])

  const handleLogout = () => {
    if (confirm('Chiqishni xohlaysizmi?')) {
      logout()
      navigate('/')
    }
  }

  // Card style based on theme
  const cardClass = isDark ? 'bg-slate-800' : 'bg-white shadow-sm'
  const textClass = isDark ? 'text-white' : 'text-slate-800'
  const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500'
  const bgItemClass = isDark ? 'bg-slate-700' : 'bg-slate-100'

  return (
    <div className={`p-4 pb-24 min-h-screen transition-colors`}>
      <h1 className={`text-2xl font-bold mb-6 ${textClass}`}>Sozlamalar</h1>

      {/* User Card */}
      <div className={`rounded-xl p-4 mb-6 ${cardClass}`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
            {user?.is_premium ? '👑' : '👤'}
          </div>
          <div className="flex-1">
            <h2 className={`font-bold text-lg ${textClass}`}>{user?.full_name || 'Foydalanuvchi'}</h2>
            <p className={`text-sm ${subTextClass}`}>@{user?.username || 'username'}</p>
            <div className="flex items-center gap-2 mt-1">
              {user?.is_premium ? (
                <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown size={12} /> Premium
                </span>
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                  Free
                </span>
              )}
              {user?.is_admin && (
                <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield size={12} /> Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Banner */}
      {!user?.is_premium && (
        <div
          onClick={() => navigate('/premium')}
          className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-4 mb-6 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Crown size={28} className="text-white" />
            <div className="flex-1">
              <p className="font-bold text-white">Premium ga o'ting</p>
              <p className="text-white/80 text-sm">Barcha darslarga kirish oling</p>
            </div>
            <ChevronRight size={20} className="text-white" />
          </div>
        </div>
      )}

      {/* Settings List */}
      <div className="space-y-4">
        {/* Theme */}
        <div className={`rounded-xl p-4 ${cardClass}`}>
          <h3 className={`font-bold mb-3 ${textClass}`}>Ko'rinish</h3>
          <div
            onClick={toggleTheme}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon size={20} className="text-blue-400" />
              ) : (
                <Sun size={20} className="text-yellow-500" />
              )}
              <span className={textClass}>Tungi rejim</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${
              isDark ? 'bg-blue-500' : 'bg-slate-300'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform shadow ${
                isDark ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className={`rounded-xl p-4 ${cardClass}`}>
          <h3 className={`font-bold mb-3 ${textClass}`}>Bildirishnomalar</h3>
          <div
            onClick={() => setNotifications(!notifications)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {notifications ? (
                <Bell size={20} className="text-green-500" />
              ) : (
                <BellOff size={20} className={subTextClass} />
              )}
              <span className={textClass}>Bildirishnomalar</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${
              notifications ? 'bg-green-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform shadow ${
                notifications ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </div>
          </div>
        </div>

        {/* Language */}
        <div className={`rounded-xl p-4 ${cardClass}`}>
          <h3 className={`font-bold mb-3 ${textClass}`}>Til</h3>
          <div className="flex gap-2">
            {[
              { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
              { code: 'ru', label: 'Русский', flag: '🇷🇺' },
              { code: 'en', label: 'English', flag: '🇬🇧' }
            ].map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                  language === lang.code
                    ? 'bg-blue-500 text-white'
                    : `${bgItemClass} ${textClass}`
                }`}
              >
                <span className="mr-1">{lang.flag}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Panel Link */}
        {user?.is_admin && (
          <div
            onClick={() => navigate('/admin')}
            className={`rounded-xl p-4 cursor-pointer transition ${cardClass} hover:opacity-80`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-blue-500" />
                <span className={textClass}>Admin Panel</span>
              </div>
              <ChevronRight size={20} className={subTextClass} />
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className={`rounded-xl p-4 ${cardClass}`}>
          <h3 className={`font-bold mb-3 ${textClass}`}>Hisob</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className={subTextClass}>Telegram ID</span>
              <span className={textClass}>{user?.telegram_id || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className={subTextClass}>Level</span>
              <span className={textClass}>{user?.level || 1}</span>
            </div>
            <div className="flex justify-between">
              <span className={subTextClass}>Jami XP</span>
              <span className={textClass}>{user?.total_xp?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className={subTextClass}>Ro'yxatdan o'tgan</span>
              <span className={textClass}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('uz-UZ') : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500/20 text-red-500 rounded-xl p-4 flex items-center justify-center gap-2 font-medium"
        >
          <LogOut size={20} />
          Chiqish
        </button>
      </div>

      {/* Version */}
      <p className={`text-center text-sm mt-6 ${subTextClass}`}>
        EduLearn v1.0.0
      </p>
    </div>
  )
}
