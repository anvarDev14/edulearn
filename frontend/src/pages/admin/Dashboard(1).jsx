import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getStats().then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  const CARDS = stats ? [
    { icon: '👥', val: stats.total_users, label: "Jami foydalanuvchi", color: 'var(--primary)', bg: 'var(--primary-dim)' },
    { icon: '💎', val: stats.premium_users, label: 'Premium', color: '#06b6d4', bg: 'var(--accent-dim)' },
    { icon: '📚', val: stats.total_modules, label: 'Kurslar', color: 'var(--gold)', bg: 'var(--gold-dim)' },
    { icon: '✅', val: stats.total_completions, label: 'Tugatishlar', color: 'var(--green)', bg: 'var(--green-dim)' },
    { icon: '💳', val: stats.pending_payments || 0, label: "Kutilayotgan to'lovlar", color: 'var(--red)', bg: 'var(--red-dim)' },
    { icon: '📖', val: stats.total_lessons, label: 'Darslar', color: 'var(--primary-light)', bg: 'var(--primary-dim)' },
  ] : []

  const MENU = [
    { icon: '👥', label: 'Foydalanuvchilar', to: '/admin/users', desc: 'Boshqarish va premium berish' },
    { icon: '📚', label: 'Kurslar va Darslar', to: '/admin/modules', desc: 'Kurs va dars qo\'shish' },
    { icon: '❓', label: 'Testlar', to: '/admin/quizzes', desc: 'Test yaratish va boshqarish' },
    { icon: '💳', label: "To'lovlar", to: '/admin/payments', desc: "Premium so'rovlarni ko'rish" },
    { icon: '⚙️', label: 'Sozlamalar', to: '/admin/settings', desc: 'Platforma sozlamalari' },
  ]

  if (loading) return <div className="loader-full"><div className="spinner" /></div>

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px' }}>Admin Panel</p>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Boshqaruv Paneli</h1>
        </div>
        <Link to="/" className="btn btn-secondary btn-sm">← Sayt</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        {CARDS.map((c, i) => (
          <div key={i} className="card" style={{ background: c.bg, borderColor: `${c.color}33` }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
            <p style={{ fontSize: 28, fontWeight: 800, color: c.color, letterSpacing: '-0.5px' }}>{c.val?.toLocaleString() || 0}</p>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Pending payments alert */}
      {stats?.pending_payments > 0 && (
        <Link to="/admin/payments">
          <div className="card" style={{ marginBottom: 20, background: 'var(--gold-dim)', borderColor: 'rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: 'var(--gold)' }}>{stats.pending_payments} ta to'lov kutilmoqda</p>
              <p style={{ fontSize: 13, color: 'var(--text3)' }}>Ko'rish va tasdiqlash →</p>
            </div>
          </div>
        </Link>
      )}

      {/* Menu */}
      <p className="section-title" style={{ marginBottom: 14 }}>Boshqaruv</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {MENU.map(item => (
          <Link key={item.to} to={item.to}>
            <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 15 }}>{item.label}</p>
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>{item.desc}</p>
              </div>
              <span style={{ color: 'var(--text3)' }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
