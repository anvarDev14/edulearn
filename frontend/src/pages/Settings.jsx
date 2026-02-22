import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Moon, Sun, Globe, Bell, Shield, HelpCircle, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  
  const handleLogout = () => {
    if (confirm("Chiqishni xohlaysizmi?")) {
      logout()
      navigate('/')
    }
  }
  
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">⚙️ Sozlamalar</h1>
      
      {/* Theme */}
      <div className="bg-slate-800 rounded-2xl mb-4">
        <button
          onClick={toggleTheme}
          className="w-full p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {isDark ? <Moon size={20} /> : <Sun size={20} />}
            <span>Mavzu</span>
          </div>
          <span className="text-slate-400">{isDark ? 'Qorong'i' : 'Yorug'}</span>
        </button>
      </div>
      
      {/* Language */}
      <div className="bg-slate-800 rounded-2xl mb-4">
        <button className="w-full p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe size={20} />
            <span>Til</span>
          </div>
          <span className="text-slate-400">O'zbek</span>
        </button>
      </div>
      
      {/* Notifications */}
      <div className="bg-slate-800 rounded-2xl mb-4">
        <button className="w-full p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} />
            <span>Bildirishnomalar</span>
          </div>
          <div className="w-10 h-6 bg-blue-500 rounded-full relative">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
          </div>
        </button>
      </div>
      
      {/* Help & Support */}
      <div className="bg-slate-800 rounded-2xl mb-4">
        <a 
          href="https://t.me/edulearn_support" 
          target="_blank"
          className="w-full p-4 flex items-center gap-3"
        >
          <HelpCircle size={20} />
          <span>Yordam</span>
        </a>
      </div>
      
      {/* Privacy */}
      <div className="bg-slate-800 rounded-2xl mb-4">
        <button className="w-full p-4 flex items-center gap-3">
          <Shield size={20} />
          <span>Maxfiylik siyosati</span>
        </button>
      </div>
      
      {/* Logout */}
      <motion.button
        onClick={handleLogout}
        className="w-full bg-red-500/20 text-red-500 rounded-2xl p-4 flex items-center justify-center gap-2"
        whileHover={{ scale: 1.02 }}
      >
        <LogOut size={20} />
        Chiqish
      </motion.button>
      
      {/* Version */}
      <p className="text-center text-slate-500 text-sm mt-6">
        EduLearn v1.0.0
      </p>
    </div>
  )
}
