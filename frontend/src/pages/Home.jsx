import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Flame, BookOpen, CheckCircle, Trophy, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { gamificationAPI, challengesAPI, newsAPI, lessonsAPI } from '../api'

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [challenges, setChallenges] = useState([])
  const [news, setNews] = useState([])
  const [modules, setModules] = useState([])

  useEffect(() => {
    Promise.all([
      gamificationAPI.getStats().then(r => setStats(r.data)).catch(() => {}),
      challengesAPI.getAll().then(r => setChallenges(r.data.slice(0, 3))).catch(() => {}),
      newsAPI.getAll(0, 3).then(r => setNews(r.data)).catch(() => {}),
      lessonsAPI.getModules().then(r => setModules(r.data.slice(0, 4))).catch(() => {}),
    ])
  }, [])

  const xpProgress = user?.level_progress ?? 0
  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Xayrli tong'
    if (h < 17) return 'Xayrli kun'
    return 'Xayrli kech'
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 1 }}>{greet()} 👋</p>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)' }}>
            {user?.full_name?.split(' ')[0] || 'Siz'}
          </h1>
        </div>
        <Link to="/profile">
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'var(--primary-dim)', border: '2px solid var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, overflow: 'hidden'
          }}>
            {user?.photo_url
              ? <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{user?.full_name?.[0] || '?'}</span>
            }
          </div>
        </Link>
      </div>

      {/* XP card */}
      <div className="card card-lg" style={{
        marginBottom: 18,
        background: 'linear-gradient(135deg, rgba(123,79,58,0.08), rgba(196,149,106,0.06))',
        borderColor: 'rgba(123,79,58,0.14)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'var(--gold-dim)', border: '1px solid rgba(184,115,51,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26
          }}>
            {user?.level_badge || '⭐'}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              {user?.level_title || 'Boshlangich'}
            </p>
            <p style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text)' }}>
              {user?.total_xp?.toLocaleString() || 0} XP
            </p>
          </div>
          <span className="badge badge-gold">Daraja {user?.level || 1}</span>
        </div>
        <div className="xp-bar-wrap">
          <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 12, color: 'var(--text3)' }}>
          <span>{xpProgress}% to'ldirildi</span>
          <span>{user?.xp_to_next || 0} XP qoldi</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="stats-grid" style={{ marginBottom: 22 }}>
        {[
          { icon: <Flame size={20} style={{ color: '#B94040' }} />, val: user?.streak_days || 0, label: 'Kun ketma-ket' },
          { icon: <Trophy size={20} style={{ color: 'var(--gold)' }} />, val: challenges.filter(c => c.user_progress?.is_completed).length, label: 'Topshiriq' },
          { icon: <BookOpen size={20} style={{ color: 'var(--primary)' }} />, val: modules.length, label: 'Kurslar' },
          { icon: <CheckCircle size={20} style={{ color: 'var(--green)' }} />, val: stats?.completed_lessons || 0, label: 'Tugatildi' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            {s.icon}
            <span className="stat-val">{s.val}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Challenges */}
      {challenges.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div className="section-header">
            <span className="section-title">🏅 Bugungi topshiriqlar</span>
            <Link to="/challenges" className="section-link" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              Hammasi <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {challenges.map(ch => (
              <div key={ch.id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>{ch.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 5, color: 'var(--text)' }}>{ch.title}</p>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, ((ch.user_progress?.current_count || 0) / ch.target_count) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  {ch.user_progress?.is_completed
                    ? <span className="badge badge-green">✓</span>
                    : <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>+{ch.xp_reward} XP</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continue learning */}
      {modules.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div className="section-header">
            <span className="section-title">📚 Davom ettirish</span>
            <Link to="/modules" className="section-link" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              Hammasi <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {modules.slice(0, 4).map(mod => (
              <Link key={mod.id} to={`/modules/${mod.id}`}>
                <div className="card card-sm" style={{ height: '100%', cursor: 'pointer' }}>
                  <div style={{ fontSize: 26, marginBottom: 7 }}>{mod.emoji || '📚'}</div>
                  <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginBottom: 7, color: 'var(--text)' }}>{mod.title}</p>
                  <span className="badge badge-primary">{mod.total_lessons || 0} dars</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* News */}
      {news.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div className="section-header">
            <span className="section-title">📰 Yangiliklar</span>
            <Link to="/news" className="section-link" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              Hammasi <ChevronRight size={14} />
            </Link>
          </div>
          {news.slice(0, 2).map(n => (
            <Link key={n.id} to={`/news/${n.id}`}>
              <div className="card card-sm" style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 3, color: 'var(--text)' }}>{n.title}</p>
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {new Date(n.created_at).toLocaleDateString('uz-UZ')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Library shortcut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <Link to="/library?tab=audio" style={{ textDecoration: 'none' }}>
          <div className="card card-sm" style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🎧</div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Audio</p>
            <p style={{ fontSize: 11, color: 'var(--text3)' }}>Darsliklar</p>
          </div>
        </Link>
        <Link to="/library?tab=books" style={{ textDecoration: 'none' }}>
          <div className="card card-sm" style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📚</div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Kitoblar</p>
            <p style={{ fontSize: 11, color: 'var(--text3)' }}>Elektron</p>
          </div>
        </Link>
      </div>

      {/* AI Chat shortcut */}
      <Link to="/ai-chat">
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(123,79,58,0.07), rgba(196,149,106,0.05))',
          borderColor: 'rgba(123,79,58,0.14)',
          display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', marginBottom: 20
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0
          }}>🧠</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 1, color: 'var(--text)' }}>AI Yordamchi</p>
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>Savolingizni bering</p>
          </div>
          <ChevronRight size={18} style={{ marginLeft: 'auto', color: 'var(--text3)' }} />
        </div>
      </Link>
    </div>
  )
}
