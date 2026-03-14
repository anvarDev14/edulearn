import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { gamificationAPI, challengesAPI, newsAPI, lessonsAPI } from '../api'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [challenges, setChallenges] = useState([])
  const [news, setNews] = useState([])
  const [modules, setModules] = useState([])

  useEffect(() => {
    Promise.all([
      gamificationAPI.getStats().then(r => setStats(r.data)).catch(() => {}),
      challengesAPI.getAll().then(r => setChallenges(r.data.slice(0,3))).catch(() => {}),
      newsAPI.getAll(0, 3).then(r => setNews(r.data)).catch(() => {}),
      lessonsAPI.getModules().then(r => setModules(r.data.slice(0,4))).catch(() => {}),
    ])
  }, [])

  const xpProgress = user?.level_progress ?? 0
  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return "Xayrli tong"
    if (h < 17) return "Xayrli kun"
    return "Xayrli kech"
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <p style={{ fontSize:13, color:'var(--text3)', marginBottom:2 }}>{greet()} 👋</p>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:'-0.5px' }}>
            {user?.full_name?.split(' ')[0] || 'Siz'}
          </h1>
        </div>
        <Link to="/profile">
          <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--primary-dim)', border:'2px solid var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, overflow:'hidden' }}>
            {user?.photo_url
              ? <img src={user.photo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <span>{user?.full_name?.[0] || '?'}</span>
            }
          </div>
        </Link>
      </div>

      {/* XP / Level card */}
      <div className="card card-lg" style={{ marginBottom:20, background:'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.08))', borderColor:'rgba(99,102,241,0.2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
          <div style={{ width:52, height:52, borderRadius:16, background:'var(--gold-dim)', border:'1px solid rgba(245,158,11,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>
            {user?.level_badge || '⭐'}
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:12, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.7px' }}>
              {user?.level_title || 'Boshlangich'}
            </p>
            <p style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.3px' }}>
              {user?.total_xp?.toLocaleString() || 0} XP
            </p>
          </div>
          <div className="badge badge-gold">Daraja {user?.level || 1}</div>
        </div>
        <div className="xp-bar-wrap">
          <div className="xp-bar-fill" style={{ width:`${xpProgress}%` }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontSize:12, color:'var(--text3)' }}>
          <span>{xpProgress}% to'ldirildi</span>
          <span>{user?.xp_to_next || 0} XP qoldi</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="stats-grid" style={{ marginBottom:24 }}>
        {[
          { icon:'🔥', val: user?.streak_days || 0, label:'Kun ketma-ket' },
          { icon:'🏅', val: challenges.filter(c=>c.user_progress?.is_completed).length, label:'Topshiriq bajarildi' },
          { icon:'📚', val: modules.length, label:'Kurslar' },
          { icon:'✅', val: stats?.completed_lessons || 0, label:'Darslar tugatildi' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:24 }}>{s.icon}</span>
            <span className="stat-val">{s.val}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Challenges */}
      {challenges.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <div className="section-header">
            <span className="section-title">🏅 Bugungi topshiriqlar</span>
            <Link to="/challenges" className="section-link">Hammasi →</Link>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {challenges.map(ch => (
              <div key={ch.id} className="card card-sm" style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:24 }}>{ch.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{ch.title}</p>
                  <div className="progress-bar" style={{ width:'100%' }}>
                    <div className="progress-bar-fill" style={{ width:`${Math.min(100, ((ch.user_progress?.current_count || 0) / ch.target_count) * 100)}%` }} />
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  {ch.user_progress?.is_completed
                    ? <span className="badge badge-green">✓</span>
                    : <span style={{ fontSize:12, color:'var(--text3)', fontWeight:600 }}>+{ch.xp_reward} XP</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continue learning */}
      {modules.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <div className="section-header">
            <span className="section-title">📚 Davom ettirish</span>
            <Link to="/modules" className="section-link">Hammasi →</Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {modules.slice(0,4).map(mod => (
              <Link key={mod.id} to={`/modules/${mod.id}`}>
                <div className="card card-sm" style={{ height:'100%', cursor:'pointer' }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{mod.icon || '📚'}</div>
                  <p style={{ fontSize:13, fontWeight:600, lineHeight:1.3, marginBottom:6 }}>{mod.title}</p>
                  <span className="badge badge-primary">{mod.lesson_count || 0} dars</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* News */}
      {news.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <div className="section-header">
            <span className="section-title">📰 Yangiliklar</span>
            <Link to="/news" className="section-link">Hammasi →</Link>
          </div>
          {news.slice(0,2).map(n => (
            <Link key={n.id} to={`/news/${n.id}`}>
              <div className="card card-sm" style={{ marginBottom:10 }}>
                <p style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{n.title}</p>
                <p style={{ fontSize:12, color:'var(--text3)' }}>
                  {new Date(n.created_at).toLocaleDateString('uz-UZ')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* AI Chat shortcut */}
      <Link to="/ai-chat">
        <div className="card" style={{ background:'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.07))', borderColor:'rgba(99,102,241,0.2)', display:'flex', alignItems:'center', gap:16, cursor:'pointer', marginBottom:20 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'var(--primary-dim)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>🧠</div>
          <div>
            <p style={{ fontWeight:700, fontSize:15, marginBottom:2 }}>AI Yordamchi</p>
            <p style={{ fontSize:13, color:'var(--text3)' }}>Savolingizni bering, AI tushuntiradi</p>
          </div>
          <span style={{ marginLeft:'auto', color:'var(--text3)', fontSize:18 }}>→</span>
        </div>
      </Link>
    </div>
  )
}
