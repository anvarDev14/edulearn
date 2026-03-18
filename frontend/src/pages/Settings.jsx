import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Moon, Sun, Bell, BellOff, LogOut, Crown,
  ChevronRight, Shield, User, Hash, BarChart2, Calendar
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications')
    return saved !== null ? saved === 'true' : true
  })
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'uz')
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    localStorage.setItem('notifications', notifications.toString())
  }, [notifications])

  useEffect(() => {
    localStorage.setItem('lang', lang)
  }, [lang])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  /* ── sub-components ── */
  const SectionLabel = ({ children }) => (
    <p style={{
      fontSize: 11, fontWeight: 700, color: 'var(--text3)',
      textTransform: 'uppercase', letterSpacing: '0.8px',
      padding: '14px 16px 6px', margin: 0,
    }}>
      {children}
    </p>
  )

  const Row = ({ icon, label, right, onClick, danger }) => (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.15s',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: danger ? 'var(--red-dim)' : 'var(--bg2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: danger ? 'var(--red)' : 'var(--text)' }}>
        {label}
      </span>
      {right}
    </div>
  )

  const Toggle = ({ value }) => (
    <div style={{
      width: 46, height: 26, borderRadius: 13, flexShrink: 0,
      background: value ? 'var(--primary)' : 'var(--border2)',
      position: 'relative', transition: 'background 0.22s',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: value ? 23 : 3,
        width: 20, height: 20, borderRadius: '50%', background: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        transition: 'left 0.22s cubic-bezier(.22,.68,0,1.2)',
      }} />
    </div>
  )

  const sep = <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <span className="emoji-soft" style={{ fontSize: 26 }}>⚙️</span>
        <div>
          <h1 className="page-title">Sozlamalar</h1>
          <p className="page-subtitle">Hisob va ilova parametrlari</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="card card-sm" style={{
        marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 14,
        background: 'linear-gradient(135deg, rgba(123,79,58,0.07), rgba(196,149,106,0.04))',
        borderColor: 'rgba(123,79,58,0.14)',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: 'var(--primary-dim)', border: '2.5px solid var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, overflow: 'hidden',
        }}>
          {user?.photo_url
            ? <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{user?.full_name?.[0] || '?'}</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 2 }}>
            {user?.full_name || 'Foydalanuvchi'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>@{user?.username || '—'}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
          {user?.is_premium && (
            <span className="badge badge-gold"><Crown size={10} /> Premium</span>
          )}
          {user?.is_admin && (
            <span className="badge badge-red"><Shield size={10} /> Admin</span>
          )}
          {!user?.is_premium && !user?.is_admin && (
            <span className="badge badge-primary">Daraja {user?.level || 1}</span>
          )}
        </div>
      </div>

      {/* Premium banner */}
      {!user?.is_premium && (
        <button
          onClick={() => navigate('/premium')}
          className="card card-sm"
          style={{
            width: '100%', marginBottom: 16, textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(184,115,51,0.1), rgba(196,149,106,0.06))',
            borderColor: 'rgba(184,115,51,0.22)',
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Crown size={20} style={{ color: 'var(--gold)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14, marginBottom: 1 }}>Premium olish</p>
            <p style={{ color: 'var(--text3)', fontSize: 12 }}>Barcha dars va quizlarga kirish</p>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text3)' }} />
        </button>
      )}

      {/* Appearance & Notifications */}
      <SectionLabel>Ko'rinish va bildirishnomalar</SectionLabel>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
        <Row
          icon={darkMode
            ? <Moon size={17} style={{ color: 'var(--primary)' }} />
            : <Sun size={17} style={{ color: 'var(--gold)' }} />
          }
          label="Tungi rejim"
          onClick={() => setDarkMode(v => !v)}
          right={<Toggle value={darkMode} />}
        />
        {sep}
        <Row
          icon={notifications
            ? <Bell size={17} style={{ color: 'var(--green)' }} />
            : <BellOff size={17} style={{ color: 'var(--text3)' }} />
          }
          label="Bildirishnomalar"
          onClick={() => setNotifications(v => !v)}
          right={<Toggle value={notifications} />}
        />
      </div>

      {/* Language */}
      <SectionLabel>Til</SectionLabel>
      <div className="card" style={{ padding: '10px 12px', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
            { code: 'ru', label: 'Русский', flag: '🇷🇺' },
            { code: 'en', label: 'English', flag: '🇬🇧' },
          ].map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className="btn btn-sm"
              style={{
                flex: 1,
                background: lang === l.code ? 'var(--primary)' : 'var(--bg2)',
                color: lang === l.code ? 'white' : 'var(--text2)',
                border: `1px solid ${lang === l.code ? 'transparent' : 'var(--border)'}`,
              }}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Admin */}
      {user?.is_admin && (
        <>
          <SectionLabel>Boshqaruv</SectionLabel>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
            <Row
              icon={<Shield size={17} style={{ color: 'var(--red)' }} />}
              label="Admin paneli"
              onClick={() => navigate('/admin')}
              right={<ChevronRight size={15} style={{ color: 'var(--text3)' }} />}
            />
          </div>
        </>
      )}

      {/* Account info */}
      <SectionLabel>Hisob ma'lumotlari</SectionLabel>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        {[
          { icon: <Hash size={15} style={{ color: 'var(--text3)' }} />, label: 'Telegram ID', val: user?.telegram_id || '—' },
          { icon: <BarChart2 size={15} style={{ color: 'var(--text3)' }} />, label: 'Daraja', val: user?.level || 1 },
          { icon: <User size={15} style={{ color: 'var(--text3)' }} />, label: 'Jami XP', val: user?.total_xp?.toLocaleString() || 0 },
          { icon: <Calendar size={15} style={{ color: 'var(--text3)' }} />, label: "Ro'yxatdan o'tgan", val: user?.created_at ? new Date(user.created_at).toLocaleDateString('uz-UZ') : '—' },
        ].map((item, i, arr) => (
          <div key={item.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </div>
              <span style={{ flex: 1, fontSize: 14, color: 'var(--text3)' }}>{item.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.val}</span>
            </div>
            {i < arr.length - 1 && sep}
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={() => setShowLogout(true)}
        className="btn btn-full"
        style={{
          background: 'var(--red-dim)', color: 'var(--red)',
          border: '1px solid rgba(185,64,64,0.15)',
          marginBottom: 24,
        }}
      >
        <LogOut size={16} /> Chiqish
      </button>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>EduLearn v1.0.0</p>

      {/* Logout confirm modal */}
      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <p className="modal-title">Chiqishni tasdiqlash</p>
            <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 22, lineHeight: 1.6 }}>
              Hisobingizdan chiqmoqchimisiz? Qayta kirish uchun Telegram bot orqali kod olasiz.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowLogout(false)}
              >
                Bekor
              </button>
              <button
                className="btn"
                style={{ flex: 1, background: 'var(--red)', color: 'white' }}
                onClick={handleLogout}
              >
                Ha, chiqish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
