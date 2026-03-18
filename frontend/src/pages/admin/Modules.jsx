import { useState, useEffect } from 'react'
import { Plus, Trash2, Crown, ChevronDown, ChevronUp, Video, ChevronLeft, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'

export default function AdminModules() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [selectedModule, setSelectedModule] = useState(null)
  const [expandedModule, setExpandedModule] = useState(null)

  const [moduleForm, setModuleForm] = useState({ title: '', description: '', emoji: '📚', is_premium: false })
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', content: '', video_url: '', duration_min: 15, xp_reward: 50, is_premium: false })

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
    } catch { alert('Xatolik') }
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
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    }
  }

  const deleteLesson = async (lessonId) => {
    if (!confirm("Darsni o'chirishni xohlaysizmi?")) return
    try {
      await adminAPI.deleteLesson(lessonId)
      loadModules()
    } catch { alert('Xatolik') }
  }

  if (!user?.is_admin) return (
    <div className="page" style={{ textAlign: 'center' }}>
      <p style={{ color: 'var(--red)', fontSize: 18 }}>🚫 Ruxsat yo'q</p>
    </div>
  )

  if (loading) return <Loader />

  const inp = {
    width: '100%', padding: '10px 12px',
    background: 'var(--bg2)', border: '1.5px solid var(--border)',
    borderRadius: 10, color: 'var(--text)', fontSize: 14, outline: 'none',
    fontFamily: 'var(--font)',
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={18} style={{ color: 'var(--text)' }} />
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>📚 Modullar</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>{modules.length} ta modul</p>
          </div>
        </div>
        <button onClick={() => setShowModuleModal(true)} className="btn btn-primary btn-sm">
          <Plus size={15} /> Modul
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {modules.map(module => (
          <div key={module.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{ padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
            >
              <span style={{ fontSize: 24 }}>{module.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{module.title}</span>
                  {module.is_premium && <Crown size={13} style={{ color: 'var(--gold)' }} />}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>{module.lessons?.length || 0} ta dars</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); openLessonModal(module) }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '5px 8px' }}
              >
                <Plus size={14} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); deleteModule(module.id) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 6px', color: 'var(--red)' }}
              >
                <Trash2 size={15} />
              </button>
              {expandedModule === module.id
                ? <ChevronUp size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                : <ChevronDown size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />
              }
            </div>

            {expandedModule === module.id && (
              <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)', padding: '10px 12px' }}>
                {module.lessons?.length > 0 ? module.lessons.map((lesson, idx) => (
                  <div key={lesson.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                    background: 'var(--surface)', borderRadius: 8, marginBottom: 6,
                    border: '1px solid var(--border)',
                  }}>
                    <span style={{ color: 'var(--text3)', fontSize: 12, width: 20, flexShrink: 0 }}>{idx + 1}.</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{lesson.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>{lesson.duration_min} daq</span>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>{lesson.xp_reward} XP</span>
                        {lesson.video_url && <Video size={11} style={{ color: 'var(--primary)' }} />}
                      </div>
                    </div>
                    <button onClick={() => deleteLesson(lesson.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--red)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )) : (
                  <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '12px 0' }}>Darslar yo'q</p>
                )}
              </div>
            )}
          </div>
        ))}
        {modules.length === 0 && (
          <div className="empty">
            <span className="empty-icon">📚</span>
            <p className="empty-title">Modullar yo'q</p>
          </div>
        )}
      </div>

      {/* Module Modal */}
      {showModuleModal && (
        <div className="modal-overlay" onClick={() => setShowModuleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <p className="modal-title" style={{ margin: 0 }}>➕ Yangi modul</p>
              <button onClick={() => setShowModuleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: 'var(--text3)' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="input-label">Modul nomi *</label>
                <input style={inp} placeholder="Masalan: Algebra" value={moduleForm.title} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Tavsif</label>
                <textarea style={{ ...inp, minHeight: 64, resize: 'vertical' }} placeholder="Modul haqida..." value={moduleForm.description} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Emoji</label>
                <input style={inp} placeholder="📚" value={moduleForm.emoji} onChange={e => setModuleForm({ ...moduleForm, emoji: e.target.value })} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>
                <input type="checkbox" checked={moduleForm.is_premium} onChange={e => setModuleForm({ ...moduleForm, is_premium: e.target.checked })} />
                <Crown size={14} style={{ color: 'var(--gold)' }} /> Premium modul
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowModuleModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Bekor</button>
              <button onClick={createModule} className="btn btn-primary" style={{ flex: 1 }}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="modal-overlay" onClick={() => setShowLessonModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <p className="modal-title" style={{ margin: 0 }}>📖 Yangi dars</p>
              <button onClick={() => setShowLessonModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: 'var(--text3)' }} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>{selectedModule?.emoji} {selectedModule?.title}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="input-label">Dars nomi *</label>
                <input style={inp} placeholder="Dars nomi" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Qisqa tavsif</label>
                <input style={inp} placeholder="Dars haqida..." value={lessonForm.description} onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })} />
              </div>
              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Video size={12} style={{ color: 'var(--primary)' }} /> Video URL (YouTube)
                </label>
                <input style={inp} type="url" placeholder="https://www.youtube.com/watch?v=..." value={lessonForm.video_url} onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Dars matni</label>
                <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} placeholder="Dars matni..." value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="input-label">Davomiylik (daq)</label>
                  <input style={inp} type="number" value={lessonForm.duration_min} onChange={e => setLessonForm({ ...lessonForm, duration_min: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="input-label">XP</label>
                  <input style={inp} type="number" value={lessonForm.xp_reward} onChange={e => setLessonForm({ ...lessonForm, xp_reward: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>
                <input type="checkbox" checked={lessonForm.is_premium} onChange={e => setLessonForm({ ...lessonForm, is_premium: e.target.checked })} />
                <Crown size={14} style={{ color: 'var(--gold)' }} /> Premium dars
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowLessonModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Bekor</button>
              <button onClick={createLesson} className="btn btn-primary" style={{ flex: 1 }}>Qo'shish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
