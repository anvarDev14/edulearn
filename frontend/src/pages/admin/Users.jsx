import { useState, useEffect } from 'react'
import { Crown, Shield, Ban } from 'lucide-react'
import { adminAPI } from '../../api'
import Loader from '../../components/common/Loader'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadUsers()
  }, [])
  
  const loadUsers = async () => {
    try {
      const res = await adminAPI.getUsers()
      setUsers(res.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const grantPremium = async (userId) => {
    const days = prompt('Necha kun?', '30')
    if (!days) return
    
    try {
      await adminAPI.grantPremium(userId, parseInt(days))
      loadUsers()
    } catch (error) {
      alert('Xatolik')
    }
  }
  
  const revokePremium = async (userId) => {
    if (!confirm('Premiumni bekor qilasizmi?')) return
    
    try {
      await adminAPI.revokePremium(userId)
      loadUsers()
    } catch (error) {
      alert('Xatolik')
    }
  }
  
  const toggleAdmin = async (userId) => {
    try {
      await adminAPI.toggleAdmin(userId)
      loadUsers()
    } catch (error) {
      alert('Xatolik')
    }
  }
  
  if (loading) return <Loader />
  
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">👥 Foydalanuvchilar</h1>
      
      <div className="space-y-3">
        {users.map(user => (
          <div key={user.id} className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{user.full_name}</span>
                  {user.is_premium && <Crown size={14} className="text-amber-500" />}
                  {user.is_admin && <Shield size={14} className="text-blue-500" />}
                </div>
                <p className="text-slate-400 text-sm">
                  @{user.username || 'no_username'} • Level {user.level}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-400">{user.total_xp} XP</p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              {user.is_premium ? (
                <button 
                  onClick={() => revokePremium(user.id)}
                  className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm"
                >
                  Premium o'chirish
                </button>
              ) : (
                <button 
                  onClick={() => grantPremium(user.id)}
                  className="flex-1 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm"
                >
                  Premium berish
                </button>
              )}
              
              <button 
                onClick={() => toggleAdmin(user.id)}
                className="px-4 py-2 bg-slate-700 rounded-lg text-sm"
              >
                {user.is_admin ? 'Admin o\'chirish' : 'Admin qilish'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
