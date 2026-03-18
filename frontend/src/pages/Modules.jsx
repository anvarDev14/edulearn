import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, Lock, CheckCircle, ChevronRight } from 'lucide-react'
import { lessonsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/common/Loader'

export default function Modules() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      const res = await lessonsAPI.getModules()
      setModules(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getModuleProgress = (module) => {
    return module.progress || 0
  }

  const isModuleLocked = (module) => {
    return module.is_premium && !user?.is_premium
  }

  if (loading) return <Loader />

  return (
    <div className="page">
      <header className="page-header">
        <div className="emoji-soft" style={{ fontSize: 28 }}>
          📚
        </div>
        <div>
          <h1 className="page-title">Modullar</h1>
          <p className="page-subtitle">Kurslarni tartibli va aniq ko‘rinishda ko‘ring</p>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {modules.map(module => {
          const progress = getModuleProgress(module)
          const locked = isModuleLocked(module)

          return (
            <button
              key={module.id}
              type="button"
              onClick={() => !locked && navigate(`/modules/${module.id}`)}
              className="card card-sm"
              style={{
                opacity: locked ? 0.55 : 1,
                cursor: locked ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                padding: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span className="emoji-soft" style={{ fontSize: 26 }}>
                  {module.emoji || '📖'}
                </span>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>{module.title}</h3>
                    {module.is_premium && (
                      <span className="badge badge-gold">
                        <Crown size={12} />
                        Premium
                      </span>
                    )}
                    {locked && !module.is_premium && (
                      <span className="badge badge-red">
                        <Lock size={11} />
                        Yopiq
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 6 }}>
                    {(module.total_lessons || 0)} ta dars
                  </p>

                  {!locked && module.total_lessons > 0 && (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          marginBottom: 4,
                          color: 'var(--text3)'
                        }}
                      >
                        <span>{progress}% tugatildi</span>
                        {progress === 100 && (
                          <span style={{ color: 'var(--green)', display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                            <CheckCircle size={11} />
                            Tugatildi
                          </span>
                        )}
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  {locked && (
                    <span
                      className="badge badge-gold"
                      style={{ fontSize: 10, paddingInline: 10, paddingBlock: 3 }}
                    >
                      <Lock size={11} />
                      Premium
                    </span>
                  )}
                  <ChevronRight size={18} style={{ color: 'var(--text3)' }} />
                </div>
              </div>
            </button>
          )
        })}

        {modules.length === 0 && (
          <div className="empty">
            <span className="empty-icon emoji-soft">📚</span>
            <p className="empty-title">Modullar hali qo‘shilmagan</p>
            <p className="empty-desc">Tez orada bu yerda kurslar paydo bo‘ladi.</p>
          </div>
        )}
      </div>

      {!user?.is_premium && modules.some(m => m.is_premium) && (
        <div style={{ marginTop: 20 }}>
          <button
            type="button"
            onClick={() => navigate('/premium')}
            className="btn btn-full btn-secondary"
          >
            <Crown size={18} />
            Premium imkoniyatlarni ko‘rish
          </button>
        </div>
      )}
    </div>
  )
}