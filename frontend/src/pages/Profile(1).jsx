import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    { icon: '🔖', label: 'Saqlangan', to: '/bookmarks' },
    { icon: '📜', label: 'Sertifikatlar', to: '/certificates' },
    { icon: '👥', label: "Do'stlar", to: '/friends' },
    { icon: '🏅', label: 'Topshiriqlar', to: '/challenges' },
    { icon: '🧠', label: 'AI Yordamchi', to: '/ai-chat' },
    { icon: '📰', label: 'Yangiliklar', to: '/news' },
    { icon: '💎', label: 'Premium', to: '/premium' },
    { icon: '⚙️', label: 'Sozlamalar', to: '/settings' },
  ]

  return (
    <div className="page">
      {/* User card */}
      <div className="card card-lg" style={{ marginBottom: 20, textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.06))', borderColor: 'rgba(99,102,241,0.15)' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-dim)', border: '3px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, overflow: 'hidden', margin: '0 auto' }}>
            {user?.photo_url
              ? <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span>{user?.full_name?.[0] || '?'}</span>
            }
          </div>
          {user?.is_premium && (
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: '#0a0a14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💎</div>
          )}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.3px' }}>{user?.full_name}</h2>
        {user?.username && <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>@{user.username}</p>}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span className="badge badge-gold">{user?.level_badge} Daraja {lvl}</span>
          {user?.is_premium && <span className="badge badge-cyan">💎 Premium</span>}
          {user?.is_admin && <span className="badge badge-red">⚡ Admin</span>}
        </div>

        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>{user?.level_title}</p>
        <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>
          {user?.total_xp?.toLocaleString() || 0} <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text3)' }}>XP</span>
        </p>

        <div className="xp-bar-wrap" style={{ marginBottom: 8 }}>
          <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>{user?.xp_to_next} XP qoldi → Daraja {lvl + 1}</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { icon: '🔥', val: user?.streak_days || 0, label: 'Kun ketma-ket' },
          { icon: '✅', val: stats?.completed_lessons || 0, label: 'Dars tugatildi' },
          { icon: '🎯', val: stats?.quiz_attempts || 0, label: 'Test ishlandi' },
          { icon: '⭐', val: stats?.avg_score ? `${stats.avg_score.toFixed(0)}%` : '—', label: "O'rtacha ball" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <span style={{ fontSize: 22, display: 'block', marginBottom: 4 }}>{s.icon}</span>
            <p className="stat-val">{s.val}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Admin shortcut */}
      {user?.is_admin && (
        <Link to="/admin">
          <div className="card card-sm" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--red-dim)', borderColor: 'rgba(239,68,68,0.2)', cursor: 'pointer' }}>
            <span style={{ fontSize: 22 }}>⚡</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Admin Panel</p>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>Boshqarish paneli</p>
            </div>
            <span style={{ color: 'var(--text3)' }}>→</span>
          </div>
        </Link>
      )}

      {/* Menu */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        {MENU.map((item, i) => (
          <Link key={item.to} to={item.to}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < MENU.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
              className="card-row-hover"
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{item.label}</span>
              <span style={{ color: 'var(--text3)', fontSize: 14 }}>→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Logout */}
      <button className="btn btn-danger btn-full" onClick={() => setShowLogout(true)}>
        🚪 Chiqish
      </button>

      {/* Logout confirm modal */}
      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <p className="modal-title">Chiqishni tasdiqlash</p>
            <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 24 }}>Hisobingizdan chiqmoqchimisiz? Qayta kirish uchun Telegram bot orqali kod olishingiz kerak bo'ladi.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowLogout(false)}>Bekor</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleLogout}>Ha, chiqish</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        a:hover .card-row-hover, .card-row-hover:hover { background: var(--surface2); }
      `}</style>
    </div>
  )
}
