import { useState, useEffect } from 'react'
import { Plus, Trash2, Crown, ChevronDown, ChevronUp, Video } from 'lucide-react'
import { adminAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'
import { AdminBottomNav } from './Dashboard'

export default function AdminModules() {
  const { user } = useAuth()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [selectedModule, setSelectedModule] = useState(null)
  const [expandedModule, setExpandedModule] = useState(null)

  const [moduleForm, setModuleForm] = useState({
    title: '', description: '', emoji: '📚', is_premium: false
  })

  const [lessonForm, setLessonForm] = useState({
    title: '', description: '', content: '', video_url: '',
    duration_min: 15, xp_reward: 50, is_premium: false
  })

  useEffect(() => { loadModules() }, [])

  const loadModules = async () => {
    try {
      const res = await adminAPI.getModules()
      setModules(res.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createModule = async () => {
    if (!moduleForm.title) return alert('Modul nomini kiriting')
    try {
      await adminAPI.createModule(moduleForm)
      setShowModuleModal(false)
      setModuleForm({ title: '', description: '', emoji: '📚', is_premium: false })
      loadModules()
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    }
  }

  const deleteModule = async (id) => {
    if (!confirm("Modulni o'chirishni xohlaysizmi?")) return
    try {
      await adminAPI.deleteModule(id)
      loadModules()
    } catch (error) {
      alert('Xatolik')
    }
  }

  const openLessonModal = (module) => {
    setSelectedModule(module)
    setLessonForm({ title: '', description: '', content: '', video_url: '', duration_min: 15, xp_reward: 50, is_premium: false })
    setShowLessonModal(true)
  }

  const createLesson = async () => {
    if (!lessonForm.title) return alert('Dars nomini kiriting')
    try {
      await adminAPI.createLesson({ ...lessonForm, module_id: selectedModule.id })
      setShowLessonModal(false)
      loadModules()
      alert('Dars qo\'shildi!')
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    }
  }

  const deleteLesson = async (lessonId) => {
    if (!confirm("Darsni o'chirishni xohlaysizmi?")) return
    try {
      await adminAPI.deleteLesson(lessonId)
      loadModules()
    } catch (error) {
      alert('Xatolik')
    }
  }

  if (!user?.is_admin) {
    return <div className="p-4 text-center"><p className="text-red-500 text-xl">🚫 Ruxsat yo'q</p></div>
  }

  if (loading) return <Loader />

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">📚 Modullar</h1>
        <button onClick={() => setShowModuleModal(true)} className="bg-blue-500 p-2 rounded-xl flex items-center gap-2">
          <Plus size={20} className="text-white" />
          <span className="text-white text-sm">Modul</span>
        </button>
      </div>

      <div className="space-y-4">
        {modules.map(module => (
          <div key={module.id} className="bg-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}>
              <span className="text-3xl">{module.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{module.title}</span>
                  {module.is_premium && <Crown size={14} className="text-amber-500" />}
                </div>
                <p className="text-slate-400 text-sm">{module.lessons?.length || 0} ta dars</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); openLessonModal(module); }} className="p-2 bg-green-500 rounded-lg">
                <Plus size={18} className="text-white" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); deleteModule(module.id); }} className="p-2 text-red-500">
                <Trash2 size={18} />
              </button>
              {expandedModule === module.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </div>

            {expandedModule === module.id && (
              <div className="border-t border-slate-700 p-4 space-y-2">
                {module.lessons?.length > 0 ? module.lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="bg-slate-700 rounded-lg p-3 flex items-center gap-3">
                    <span className="text-slate-400 text-sm w-6">{idx + 1}.</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{lesson.title}</p>
                      <div className="flex items-center gap-3 text-slate-400 text-xs mt-1">
                        <span>{lesson.duration_min} daq</span>
                        <span>{lesson.xp_reward} XP</span>
                        {lesson.video_url && <Video size={12} className="text-blue-400" />}
                      </div>
                    </div>
                    <button onClick={() => deleteLesson(lesson.id)} className="p-1 text-red-400"><Trash2 size={16} /></button>
                  </div>
                )) : <p className="text-slate-500 text-center py-4">Darslar yo'q</p>}
              </div>
            )}
          </div>
        ))}
        {modules.length === 0 && <p className="text-center text-slate-400 py-8">Modullar yo'q</p>}
      </div>

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">➕ Yangi modul</h2>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Modul nomi *</label>
                <input type="text" placeholder="Masalan: Algebra" value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" />
              </div>
              <div>
                <label className="text-slate-400 text-sm">Tavsif</label>
                <textarea placeholder="Modul haqida..." value={moduleForm.description} onChange={e => setModuleForm({...moduleForm, description: e.target.value})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" rows={2} />
              </div>
              <div>
                <label className="text-slate-400 text-sm">Emoji</label>
                <input type="text" placeholder="📚" value={moduleForm.emoji} onChange={e => setModuleForm({...moduleForm, emoji: e.target.value})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" />
              </div>
              <label className="flex items-center gap-2 text-white">
                <input type="checkbox" checked={moduleForm.is_premium} onChange={e => setModuleForm({...moduleForm, is_premium: e.target.checked})} className="w-5 h-5" />
                <Crown size={16} className="text-amber-500" /> Premium
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModuleModal(false)} className="flex-1 py-3 bg-slate-700 rounded-xl text-white">Bekor</button>
              <button onClick={createModule} className="flex-1 py-3 bg-blue-500 rounded-xl text-white font-bold">Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md my-8">
            <h2 className="text-xl font-bold mb-1 text-white">📖 Yangi dars</h2>
            <p className="text-slate-400 text-sm mb-4">{selectedModule?.emoji} {selectedModule?.title}</p>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Dars nomi *</label>
                <input type="text" placeholder="Dars nomi" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" />
              </div>
              <div>
                <label className="text-slate-400 text-sm">Qisqa tavsif</label>
                <input type="text" placeholder="Dars haqida..." value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" />
              </div>
              <div>
                <label className="text-slate-400 text-sm flex items-center gap-2"><Video size={14} className="text-blue-400" /> Video URL (YouTube)</label>
                <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={lessonForm.video_url} onChange={e => setLessonForm({...lessonForm, video_url: e.target.value})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" />
              </div>
              <div>
                <label className="text-slate-400 text-sm">Dars matni</label>
                <textarea placeholder="Dars matni..." value={lessonForm.content} onChange={e => setLessonForm({...lessonForm, content: e.target.value})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-sm">Davomiylik (daq)</label>
                  <input type="number" value={lessonForm.duration_min} onChange={e => setLessonForm({...lessonForm, duration_min: parseInt(e.target.value) || 0})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm">XP</label>
                  <input type="number" value={lessonForm.xp_reward} onChange={e => setLessonForm({...lessonForm, xp_reward: parseInt(e.target.value) || 0})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-white">
                <input type="checkbox" checked={lessonForm.is_premium} onChange={e => setLessonForm({...lessonForm, is_premium: e.target.checked})} className="w-5 h-5" />
                <Crown size={16} className="text-amber-500" /> Premium
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowLessonModal(false)} className="flex-1 py-3 bg-slate-700 rounded-xl text-white">Bekor</button>
              <button onClick={createLesson} className="flex-1 py-3 bg-green-500 rounded-xl text-white font-bold">Qo'shish</button>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  )
}