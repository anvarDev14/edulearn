import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Lock, Play, CheckCircle, Crown, ChevronRight } from 'lucide-react'
import { lessonsAPI } from '../api'
import Loader from '../components/common/Loader'

export default function ModuleLessons() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLessons()
  }, [moduleId])

  const loadLessons = async () => {
    try {
      const res = await lessonsAPI.getModuleLessons(moduleId)
      setData(res.data)
    } catch (error) {
      if (error.response?.status === 403) navigate('/premium')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />
  if (!data) return null

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 32 }}>{data.module.emoji}</span>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text)' }}>{data.module.title}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 1 }}>{data.lessons.length} ta dars</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.lessons.map((lesson, i) => {
          const isLocked = lesson.is_locked
          const isDone = lesson.is_completed
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => !isLocked && navigate(`/lesson/${lesson.id}`)}
              className="card card-sm"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: isLocked ? 0.55 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.18s',
                animation: `fadeIn 0.3s ease ${i * 0.04}s both`,
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDone ? 'var(--green-dim)' : isLocked ? 'var(--bg2)' : 'var(--primary-dim)',
              }}>
                {isDone
                  ? <CheckCircle size={18} style={{ color: 'var(--green)' }} />
                  : isLocked
                    ? <Lock size={16} style={{ color: 'var(--text3)' }} />
                    : <Play size={17} style={{ color: 'var(--primary)' }} />
                }
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lesson.title}
                  </p>
                  {lesson.is_premium && <Crown size={12} style={{ color: 'var(--gold)', flexShrink: 0 }} />}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {lesson.duration_min} daqiqa · {lesson.xp_reward} XP
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {lesson.has_quiz && (
                  <span className="badge badge-cyan" style={{ fontSize: 10 }}>Quiz</span>
                )}
                {!isLocked && <ChevronRight size={15} style={{ color: 'var(--text3)' }} />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
