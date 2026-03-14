import { useState, useEffect } from 'react'
import { challengesAPI } from '../api'

export default function Challenges() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    challengesAPI.getAll()
      .then(r => setChallenges(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? challenges
    : filter === 'done' ? challenges.filter(c => c.user_progress?.is_completed)
    : challenges.filter(c => !c.user_progress?.is_completed)

  const doneCount = challenges.filter(c => c.user_progress?.is_completed).length

  if (loading) return (
    <div className="loader-full">
      <div className="spinner" />
    </div>
  )

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🏅 Topshiriqlar</h1>
      </div>

      {/* Summary */}
      <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(99,102,241,0.06))', borderColor: 'rgba(245,158,11,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 40 }}>🏆</span>
          <div>
            <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>{doneCount}/{challenges.length}</p>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>Topshiriq bajarildi</p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>
              +{challenges.filter(c => c.user_progress?.is_completed).reduce((s, c) => s + c.xp_reward, 0)}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>XP topildi</p>
          </div>
        </div>
        <div className="progress-bar" style={{ marginTop: 14 }}>
          <div className="progress-bar-fill" style={{ width: `${challenges.length ? (doneCount / challenges.length) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Filter */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {[['all', 'Hammasi'], ['active', 'Faol'], ['done', 'Bajarildi']].map(([v, l]) => (
          <button key={v} className={`tab ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">🎯</span>
          <p className="empty-title">Topshiriq yo'q</p>
          <p className="empty-desc">Hozircha bu bo'limda topshiriq topilmadi</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(ch => {
            const progress = ch.user_progress
            const pct = Math.min(100, ((progress?.current_count || 0) / ch.target_count) * 100)
            const done = progress?.is_completed
            return (
              <div key={ch.id} className="card" style={{ opacity: done ? 0.7 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: done ? 'var(--green-dim)' : 'var(--gold-dim)', border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {done ? '✅' : ch.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <p style={{ fontSize: 15, fontWeight: 700 }}>{ch.title}</p>
                      <span className={`badge ${done ? 'badge-green' : 'badge-gold'}`}>+{ch.xp_reward} XP</span>
                    </div>
                    {ch.description && <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 10 }}>{ch.description}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: done ? 'var(--green)' : undefined }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                        {progress?.current_count || 0}/{ch.target_count}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <span className={`badge ${ch.challenge_type === 'daily' ? 'badge-cyan' : ch.challenge_type === 'weekly' ? 'badge-primary' : 'badge-gold'}`}>
                    {ch.challenge_type === 'daily' ? '📅 Kunlik' : ch.challenge_type === 'weekly' ? '📆 Haftalik' : '⭐ Maxsus'}
                  </span>
                  {ch.expires_at && (
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                      Muddati: {new Date(ch.expires_at).toLocaleDateString('uz-UZ')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
