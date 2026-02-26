import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Bell, BellOff, Globe, LogOut, Crown, ChevronRight, User, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme ? useTheme() : { theme: 'dark', toggleTheme: () => {} }
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState('uz')

  const handleLogout = () => {
    if (confirm('Chiqishni xohlaysizmi?')) {
      logout()
      navigate('/')
    }
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-white mb-6">⚙️ Sozlamalar</h1>

      {/* User Card */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
            {user?.is_premium ? '👑' : '👤'}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-white text-lg">{user?.full_name || 'Foydalanuvchi'}</h2>
            <p className="text-slate-400 text-sm">@{user?.username || 'username'}</p>
            <div className="flex items-center gap-2 mt-1">
              {user?.is_premium ? (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown size={12} /> Premium
                </span>
              ) : (
                <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                  Free
                </span>
              )}
              {user?.is_admin && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
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
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="font-bold text-white mb-3">🎨 Ko'rinish</h3>
          <div
            onClick={toggleTheme}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon size={20} className="text-blue-400" />
              ) : (
                <Sun size={20} className="text-yellow-400" />
              )}
              <span className="text-white">Tungi rejim</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-blue-500' : 'bg-slate-600'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="font-bold text-white mb-3">🔔 Bildirishnomalar</h3>
          <div
            onClick={() => setNotifications(!notifications)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {notifications ? (
                <Bell size={20} className="text-green-400" />
              ) : (
                <BellOff size={20} className="text-slate-400" />
              )}
              <span className="text-white">Bildirishnomalar</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${
              notifications ? 'bg-green-500' : 'bg-slate-600'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                notifications ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="font-bold text-white mb-3">🌐 Til</h3>
          <div className="flex gap-2">
            {[
              { code: 'uz', label: "🇺🇿 O'zbek" },
              { code: 'ru', label: '🇷🇺 Русский' },
              { code: 'en', label: '🇬🇧 English' }
            ].map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex-1 py-2 rounded-lg text-sm transition ${
                  language === lang.code
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Panel Link */}
        {user?.is_admin && (
          <div
            onClick={() => navigate('/admin')}
            className="bg-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-700 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-blue-400" />
                <span className="text-white">Admin Panel</span>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="font-bold text-white mb-3">👤 Hisob</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Telegram ID</span>
              <span className="text-white">{user?.telegram_id || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Level</span>
              <span className="text-white">{user?.level || 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Jami XP</span>
              <span className="text-white">{user?.total_xp?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ro'yxatdan o'tgan</span>
              <span className="text-white">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('uz-UZ') : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500/20 text-red-400 rounded-xl p-4 flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Chiqish
        </button>
      </div>

      {/* Version */}
      <p className="text-center text-slate-500 text-sm mt-6">
        EduLearn v1.0.0
      </p>
    </div>
  )
}