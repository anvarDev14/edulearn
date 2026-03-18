import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Bookmark, ScrollText, Users, Target, Brain, Newspaper, Crown, Settings, LogOut, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { gamificationAPI } from '../api'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    gamificationAPI.getStats().then(r => setStats(r.data)).catch(() => {})
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const lvl = user?.level || 1
  const xpProgress = user?.level_progress ?? 0

  const MENU = [
    { icon: Bookmark, label: 'Saqlangan', to: '/bookmarks' },
    { icon: ScrollText, label: 'Sertifikatlar', to: '/certificates' },
    { icon: Users, label: "Do'stlar", to: '/friends' },
    { icon: Target, label: 'Topshiriqlar', to: '/challenges' },
    { icon: Brain, label: 'AI Yordamchi', to: '/ai-chat' },
    { icon: Newspaper, label: 'Yangiliklar', to: '/news' },
    { icon: Crown, label: 'Premium', to: '/premium' },
    { icon: Settings, label: 'Sozlamalar', to: '/settings' },
  ]

  return (
    <div className="page">
      {/* User card */}
      <div className="card card-lg" style={{
        marginBottom: 18, textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(123,79,58,0.08), rgba(196,149,106,0.05))',
        borderColor: 'rgba(123,79,58,0.14)'
      }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%',
            background: 'var(--primary-dim)', border: '3px solid var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, overflow: 'hidden', margin: '0 auto'
          }}>
            {user?.photo_url
              ? <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{user?.full_name?.[0] || '?'}</span>
            }
          </div>
          {user?.is_premium && (
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 22, height: 22, borderRadius: '50%',
              background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13
            }}>💎</div>
          )}
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 3, color: 'var(--text)' }}>{user?.full_name}</h2>
        {user?.username && <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 10 }}>@{user.username}</p>}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          <span className="badge badge-gold">{user?.level_badge} Daraja {lvl}</span>
          {user?.is_premium && <span className="badge badge-cyan">💎 Premium</span>}
          {user?.is_admin && <span className="badge badge-red">⚡ Admin</span>}
        </div>

        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>{user?.level_title}</p>
        <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', marginBottom: 10, color: 'var(--text)' }}>
          {user?.total_xp?.toLocaleString() || 0} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text3)' }}>XP</span>
        </p>

        <div className="xp-bar-wrap" style={{ marginBottom: 6 }}>
          <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--text3)' }}>{user?.xp_to_next} XP qoldi → Daraja {lvl + 1}</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 18 }}>
        {[
          { icon: '🔥', val: user?.streak_days || 0, label: 'Kun ketma-ket' },
          { icon: '✅', val: stats?.completed_lessons || 0, label: 'Dars tugatildi' },
          { icon: '🎯', val: stats?.quiz_attempts || 0, label: 'Test ishlandi' },
          { icon: '⭐', val: stats?.avg_score ? `${stats.avg_score.toFixed(0)}%` : '—', label: "O'rtacha ball" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <span style={{ fontSize: 20, display: 'block', marginBottom: 4 }}>{s.icon}</span>
            <p className="stat-val">{s.val}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Admin shortcut */}
      {user?.is_admin && (
        <Link to="/admin">
          <div className="card card-sm" style={{
            marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--red-dim)', borderColor: 'rgba(185,64,64,0.15)', cursor: 'pointer'
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(185,64,64,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} style={{ color: 'var(--red)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Admin Panel</p>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>Boshqarish paneli</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text3)' }} />
          </div>
        </Link>
      )}

      {/* Menu */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
        {MENU.map((item, i) => {
          const Icon = item.icon
          return (
            <Link key={item.to} to={item.to}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px',
                borderBottom: i < MENU.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: 'var(--primary)' }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, flex: 1, color: 'var(--text)' }}>{item.label}</span>
                <ChevronRight size={15} style={{ color: 'var(--text3)' }} />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Logout */}
      <button className="btn btn-danger btn-full" style={{ marginBottom: 4 }} onClick={() => setShowLogout(true)}>
        <LogOut size={16} /> Chiqish
      </button>

      {/* Logout modal */}
      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <p className="modal-title">Chiqishni tasdiqlash</p>
            <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 22 }}>
              Hisobingizdan chiqmoqchimisiz? Qayta kirish uchun Telegram bot orqali kod olasiz.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowLogout(false)}>Bekor</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleLogout}>Ha, chiqish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
