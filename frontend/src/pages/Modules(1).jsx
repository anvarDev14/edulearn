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
    if (!module.lessons || module.lessons.length === 0) return 0
    const completed = module.lessons.filter(l => l.is_completed).length
    return Math.round((completed / module.lessons.length) * 100)
  }

  const isModuleLocked = (module) => {
    return module.is_premium && !user?.is_premium
  }

  if (loading) return <Loader />

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-white mb-2">📚 Modullar</h1>
      <p className="text-slate-400 mb-6">O'rganishni davom eting</p>

      <div className="space-y-4">
        {modules.map(module => {
          const progress = getModuleProgress(module)
          const locked = isModuleLocked(module)

          return (
            <div
              key={module.id}
              onClick={() => !locked && navigate(`/modules/${module.id}`)}
              className={`bg-slate-800 rounded-xl p-4 transition ${
                locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{module.emoji || '📖'}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{module.title}</h3>
                    {module.is_premium && <Crown size={16} className="text-amber-500" />}
                    {locked && <Lock size={14} className="text-slate-400" />}
                  </div>
                  <p className="text-slate-400 text-sm">
                    {module.lessons?.length || 0} ta dars
                  </p>

                  {/* Progress bar */}
                  {!locked && module.lessons?.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">{progress}% tugatildi</span>
                        {progress === 100 && (
                          <span className="text-green-400 flex items-center gap-1">
                            <CheckCircle size={12} /> Tugatildi
                          </span>
                        )}
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {locked ? (
                  <div className="bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded-full">
                    Premium
                  </div>
                ) : (
                  <ChevronRight size={20} className="text-slate-400" />
                )}
              </div>
            </div>
          )
        })}

        {modules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">📚</p>
            <p className="text-slate-400">Modullar hali qo'shilmagan</p>
          </div>
        )}
      </div>

      {/* Premium banner */}
      {!user?.is_premium && modules.some(m => m.is_premium) && (
        <div
          onClick={() => navigate('/premium')}
          className="mt-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-4 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Crown size={24} className="text-white" />
            <div className="flex-1">
              <p className="font-bold text-white">Premium ga o'ting</p>
              <p className="text-white/80 text-sm">Barcha darslarga kirish oling</p>
            </div>
            <ChevronRight size={20} className="text-white" />
          </div>
        </div>
      )}
    </div>
  )
}