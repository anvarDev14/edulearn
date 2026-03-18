import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Bell, BellOff, LogOut, Crown, ChevronRight, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme, language, setLanguage, t } = useTheme()
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications')
    return saved !== null ? saved === 'true' : true
  })

  const isDark = theme === 'dark'

  useEffect(() => {
    localStorage.setItem('notifications', notifications.toString())
  }, [notifications])

  const handleLogout = () => {
    if (confirm('Chiqishni tasdiqlaysizmi?')) {
      logout()
      navigate('/')
    }
  }

  const Row = ({ icon, label, right, onClick }) => (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 15px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{label}</span>
      {right}
    </div>
  )

  const Toggle = ({ value }) => (
    <div style={{
      width: 44, height: 24, borderRadius: 12, flexShrink: 0,
      background: value ? 'var(--primary)' : 'var(--border2)',
      position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: value ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%', background: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        transition: 'left 0.2s',
      }} />
    </div>
  )

  return (
    <div className="page">
      <div className="page-header">
        <span style={{ fontSize: 24 }}>⚙️</span>
        <div>
          <h1 className="page-title">{t('settings.title')}</h1>
          <p className="page-subtitle">Ilova sozlamalari</p>
        </div>
      </div>

      {/* User card */}
      <div className="card card-sm" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--primary-dim)', border: '2px solid var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, overflow: 'hidden', flexShrink: 0
        }}>
          {user?.photo_url
            ? <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{user?.full_name?.[0] || '?'}</span>
          }
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{user?.full_name || 'User'}</p>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>@{user?.username || 'username'}</p>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {user?.is_premium && <span className="badge badge-gold"><Crown size={10} /> Premium</span>}
          {user?.is_admin && <span className="badge badge-red"><Shield size={10} /> Admin</span>}
        </div>
      </div>

      {/* Premium banner */}
      {!user?.is_premium && (
        <button
          onClick={() => navigate('/premium')}
          className="card card-sm"
          style={{
            width: '100%', marginBottom: 16, textAlign: 'left',
            background: 'linear-gradient(135deg, rgba(184,115,51,0.1), rgba(196,149,106,0.07))',
            borderColor: 'rgba(184,115,51,0.2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <Crown size={24} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{t('settings.goPremium')}</p>
            <p style={{ color: 'var(--text3)', fontSize: 12 }}>{t('settings.allAccess')}</p>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text3)' }} />
        </button>
      )}

      {/* Settings sections */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
        <Row
          icon={isDark ? <Moon size={16} style={{ color: 'var(--primary)' }} /> : <Sun size={16} style={{ color: 'var(--gold)' }} />}
          label={t('settings.darkMode')}
          onClick={toggleTheme}
          right={<Toggle value={isDark} />}
        />
        <div style={{ borderTop: '1px solid var(--border)' }} />
        <Row
          icon={notifications ? <Bell size={16} style={{ color: 'var(--green)' }} /> : <BellOff size={16} style={{ color: 'var(--text3)' }} />}
          label={t('settings.notifications')}
          onClick={() => setNotifications(!notifications)}
          right={<Toggle value={notifications} />}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ padding: '12px 15px 8px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {t('settings.language')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '0 15px 14px' }}>
          {[
            { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
            { code: 'ru', label: 'Русский', flag: '🇷🇺' },
            { code: 'en', label: 'English', flag: '🇬🇧' },
          ].map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`btn btn-sm${language === lang.code ? ' btn-primary' : ' btn-secondary'}`}
              style={{ flex: 1 }}
            >
              {lang.flag} {lang.label}
            </button>
          ))}
        </div>
      </div>

      {user?.is_admin && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
          <Row
            icon={<Shield size={16} style={{ color: 'var(--red)' }} />}
            label={t('settings.adminPanel')}
            onClick={() => navigate('/admin')}
            right={<ChevronRight size={15} style={{ color: 'var(--text3)' }} />}
          />
        </div>
      )}

      <div className="card" style={{ padding: '12px 15px', marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
          {t('settings.account')}
        </p>
        {[
          [t('settings.telegramId'), user?.telegram_id || '-'],
          [t('profile.level'), user?.level || 1],
          [t('home.totalXP'), user?.total_xp?.toLocaleString() || 0],
          [t('settings.registeredAt'), user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: 'var(--text3)' }}>{k}</span>
            <span style={{ color: 'var(--text)', fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="btn btn-danger btn-full"
      >
        <LogOut size={16} /> {t('settings.logout')}
      </button>

      <p style={{ textAlign: 'center', fontSize: 12, marginTop: 20, color: 'var(--text3)' }}>EduLearn v1.0.0</p>
    </div>
  )
}
