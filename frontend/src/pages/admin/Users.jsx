import { useState, useEffect } from 'react'
import { Crown, Shield, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'

export default function AdminUsers() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadUsers() }, [])

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
    } catch { alert('Xatolik') }
  }

  const revokePremium = async (userId) => {
    if (!confirm('Premiumni bekor qilasizmi?')) return
    try {
      await adminAPI.revokePremium(userId)
      loadUsers()
    } catch { alert('Xatolik') }
  }

  const toggleAdmin = async (userId) => {
    try {
      await adminAPI.toggleAdmin(userId)
      loadUsers()
    } catch { alert('Xatolik') }
  }

  if (!user?.is_admin) return (
    <div className="page" style={{ textAlign: 'center' }}>
      <p style={{ color: 'var(--red)', fontSize: 18 }}>🚫 Ruxsat yo'q</p>
    </div>
  )

  if (loading) return <Loader />

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ChevronLeft size={18} style={{ color: 'var(--text)' }} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>👥 Foydalanuvchilar</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>{users.length} ta foydalanuvchi</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {users.map(u => (
          <div key={u.id} className="card card-sm">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--primary-dim)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {u.full_name?.[0] || '?'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{u.full_name}</span>
                    {u.is_premium && <Crown size={13} style={{ color: 'var(--gold)' }} />}
                    {u.is_admin && <Shield size={13} style={{ color: 'var(--primary)' }} />}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text3)' }}>@{u.username || 'no_username'} · Level {u.level}</p>
                </div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>{u.total_xp?.toLocaleString()} XP</span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {u.is_premium ? (
                <button onClick={() => revokePremium(u.id)} className="btn btn-danger btn-sm" style={{ flex: 1 }}>
                  Premium o'chirish
                </button>
              ) : (
                <button onClick={() => grantPremium(u.id)} className="btn btn-gold btn-sm" style={{ flex: 1 }}>
                  <Crown size={13} /> Premium berish
                </button>
              )}
              <button onClick={() => toggleAdmin(u.id)} className="btn btn-secondary btn-sm">
                {u.is_admin ? 'Admin o\'chirish' : 'Admin qilish'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
