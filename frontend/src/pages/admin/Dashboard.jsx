import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Crown, BookOpen, CheckCircle, CreditCard, FileText, ChevronRight, AlertTriangle } from 'lucide-react'
import { adminAPI } from '../../api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getStats().then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  const CARDS = stats ? [
    { icon: <Users size={18} style={{ color: 'var(--primary)' }} />, val: stats.total_users, label: 'Foydalanuvchi', bg: 'var(--primary-dim)' },
    { icon: <Crown size={18} style={{ color: 'var(--gold)' }} />, val: stats.premium_users, label: 'Premium', bg: 'var(--gold-dim)' },
    { icon: <BookOpen size={18} style={{ color: 'var(--accent)' }} />, val: stats.total_modules, label: 'Kurslar', bg: 'var(--accent-dim)' },
    { icon: <CheckCircle size={18} style={{ color: 'var(--green)' }} />, val: stats.total_completions, label: 'Tugatishlar', bg: 'var(--green-dim)' },
    { icon: <CreditCard size={18} style={{ color: 'var(--red)' }} />, val: stats.pending_payments || 0, label: "Kutilayotgan to'lovlar", bg: 'var(--red-dim)' },
    { icon: <FileText size={18} style={{ color: 'var(--primary)' }} />, val: stats.total_lessons, label: 'Darslar', bg: 'var(--primary-dim)' },
  ] : []

  const MENU = [
    { icon: '👥', label: 'Foydalanuvchilar', to: '/admin/users', desc: 'Boshqarish va premium berish' },
    { icon: '📚', label: 'Kurslar va Darslar', to: '/admin/modules', desc: "Kurs va dars qo'shish" },
    { icon: '❓', label: 'Testlar', to: '/admin/quizzes', desc: 'Test yaratish va boshqarish' },
    { icon: '📰', label: 'Yangiliklar', to: '/admin/news', desc: "Yangilik qo'shish va boshqarish" },
    { icon: '💳', label: "To'lovlar", to: '/admin/payments', desc: "Premium so'rovlarni ko'rish" },
    { icon: '⚙️', label: 'Sozlamalar', to: '/admin/settings', desc: 'Platforma sozlamalari' },
  ]

  if (loading) return <div className="loader-full"><div className="spinner" /></div>

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px' }}>Admin Panel</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Boshqaruv Paneli</h1>
        </div>
        <Link to="/" className="btn btn-secondary btn-sm">← Sayt</Link>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
        {CARDS.map((c, i) => (
          <div key={i} className="card" style={{ background: c.bg, borderColor: 'transparent' }}>
            <div style={{ marginBottom: 8 }}>{c.icon}</div>
            <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>{c.val?.toLocaleString() || 0}</p>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {stats?.pending_payments > 0 && (
        <Link to="/admin/payments">
          <div className="card card-sm" style={{
            marginBottom: 18,
            background: 'var(--gold-dim)', borderColor: 'rgba(184,115,51,0.25)',
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer'
          }}>
            <AlertTriangle size={20} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 14 }}>{stats.pending_payments} ta to'lov kutilmoqda</p>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>Ko'rish va tasdiqlash</p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text3)' }} />
          </div>
        </Link>
      )}

      {/* Menu */}
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12 }}>Boshqaruv</p>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {MENU.map((item, i) => (
          <Link key={item.to} to={item.to}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 15px',
              borderBottom: i < MENU.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{item.label}</p>
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>{item.desc}</p>
              </div>
              <ChevronRight size={15} style={{ color: 'var(--text3)' }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
