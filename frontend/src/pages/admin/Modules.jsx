import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Crown, ChevronDown, ChevronUp, Video, BookOpen, Clock, Zap, GraduationCap, X, Loader2 } from 'lucide-react'
import { adminAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'

export default function AdminModules() {
  const { user } = useAuth()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [selectedModule, setSelectedModule] = useState(null)
  const [expandedModule, setExpandedModule] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

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
    setSaving(true)
    try {
      await adminAPI.createModule(moduleForm)
      setShowModuleModal(false)
      setModuleForm({ title: '', description: '', emoji: '📚', is_premium: false })
      loadModules()
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    } finally { setSaving(false) }
  }

  const deleteModule = async (id) => {
    if (!confirm("Modulni o'chirishni xohlaysizmi?")) return
    setDeleting(id)
    try {
      await adminAPI.deleteModule(id)
      loadModules()
    } catch {
      alert('Xatolik')
    } finally { setDeleting(null) }
  }

  const openLessonModal = (module) => {
    setSelectedModule(module)
    setLessonForm({ title: '', description: '', content: '', video_url: '', duration_min: 15, xp_reward: 50, is_premium: false })
    setShowLessonModal(true)
  }

  const createLesson = async () => {
    if (!lessonForm.title) return alert('Dars nomini kiriting')
    setSaving(true)
    try {
      await adminAPI.createLesson({ ...lessonForm, module_id: selectedModule.id })
      setShowLessonModal(false)
      loadModules()
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    } finally { setSaving(false) }
  }

  const deleteLesson = async (lessonId) => {
    if (!confirm("Darsni o'chirishni xohlaysizmi?")) return
    setDeleting(lessonId)
    try {
      await adminAPI.deleteLesson(lessonId)
      loadModules()
    } catch {
      alert('Xatolik')
    } finally { setDeleting(null) }
  }

  if (!user?.is_admin) return (
    <div style={{ padding: 24, textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
      <p style={{ color: 'var(--red)', fontWeight: 600, fontSize: 16 }}>Ruxsat yo'q</p>
    </div>
  )

  if (loading) return <Loader />

  return (
    <div style={{ padding: '20px 0', paddingBottom: 96 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: 'var(--primary-dim)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <GraduationCap size={20} color="var(--primary-light)" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Modullar</h1>
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>{modules.length} ta kurs</p>
          </div>
        </div>
        <button
          onClick={() => setShowModuleModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 12, border: 'none',
            background: 'var(--primary)', color: 'white',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          <Plus size={18} /> Modul
        </button>
      </div>

      {/* Modules list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {modules.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text3)' }}>
            <GraduationCap size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>Modullar yo'q</p>
            <p style={{ fontSize: 13 }}>Yangi modul qo'shing</p>
          </div>
        )}
        {modules.map(module => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, overflow: 'hidden',
            }}
          >
            {/* Module row */}
            <div
              onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
              style={{
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: 'var(--surface2)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
                border: '1px solid var(--border)',
              }}>
                {module.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{module.title}</p>
                  {module.is_premium && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 7px', borderRadius: 50,
                      background: 'var(--gold-dim)', color: 'var(--gold)', fontSize: 10, fontWeight: 700,
                    }}>
                      <Crown size={10} /> PRO
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                  {module.lessons?.length || 0} ta dars
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); openLessonModal(module) }}
                style={{
                  width: 34, height: 34, borderRadius: 10, border: 'none',
                  background: 'var(--green-dim)', color: 'var(--green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                <Plus size={17} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); deleteModule(module.id) }}
                disabled={deleting === module.id}
                style={{
                  width: 34, height: 34, borderRadius: 10, border: 'none',
                  background: 'var(--red-dim)', color: 'var(--red)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                {deleting === module.id
                  ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
                  : <Trash2 size={15} />
                }
              </button>
              <div style={{ color: 'var(--text3)', display: 'flex' }}>
                {expandedModule === module.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {/* Expanded lessons */}
            <AnimatePresence>
              {expandedModule === module.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    padding: '12px 16px',
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    {module.lessons?.length > 0 ? module.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        style={{
                          background: 'var(--surface2)', borderRadius: 10,
                          padding: '10px 12px', display: 'flex',
                          alignItems: 'center', gap: 10,
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div style={{
                          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                          background: 'var(--primary-dim)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: 'var(--primary-light)',
                        }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{lesson.title}</p>
                          <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text3)' }}>
                              <Clock size={10} /> {lesson.duration_min} daq
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--gold)' }}>
                              <Zap size={10} /> {lesson.xp_reward} XP
                            </span>
                            {lesson.video_url && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent)' }}>
                                <Video size={10} /> Video
                              </span>
                            )}
                            {lesson.is_premium && (
                              <span style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 700 }}>PRO</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteLesson(lesson.id)}
                          disabled={deleting === lesson.id}
                          style={{
                            width: 28, height: 28, borderRadius: 8, border: 'none',
                            background: 'transparent', color: 'var(--red)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          }}
                        >
                          {deleting === lesson.id
                            ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
                            : <Trash2 size={13} />
                          }
                        </button>
                      </div>
                    )) : (
                      <p style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '16px 0' }}>
                        Bu modulda darslar yo'q
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Module Modal */}
      <AnimatePresence>
        {showModuleModal && (
          <Modal title="Yangi modul" onClose={() => setShowModuleModal(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <FormField label="Modul nomi *">
                <input
                  type="text" placeholder="Masalan: Algebra" value={moduleForm.title}
                  onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="input"
                />
              </FormField>
              <FormField label="Tavsif">
                <textarea
                  placeholder="Modul haqida..." value={moduleForm.description}
                  onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="input" rows={2} style={{ resize: 'none' }}
                />
              </FormField>
              <FormField label="Emoji">
                <input
                  type="text" placeholder="📚" value={moduleForm.emoji}
                  onChange={e => setModuleForm({ ...moduleForm, emoji: e.target.value })}
                  className="input" style={{ fontSize: 22 }}
                />
              </FormField>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div
                  onClick={() => setModuleForm({ ...moduleForm, is_premium: !moduleForm.is_premium })}
                  style={{
                    width: 42, height: 24, borderRadius: 50,
                    background: moduleForm.is_premium ? 'var(--gold)' : 'var(--surface2)',
                    border: '1px solid var(--border)', position: 'relative', transition: 'all 0.2s', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 2, left: moduleForm.is_premium ? 20 : 2,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'white', transition: 'left 0.2s',
                  }} />
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text)' }}>
                  <Crown size={15} color="var(--gold)" /> Premium kurs
                </span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowModuleModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Bekor</button>
              <button onClick={createModule} disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
                {saving ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : 'Saqlash'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Lesson Modal */}
      <AnimatePresence>
        {showLessonModal && (
          <Modal
            title="Yangi dars"
            subtitle={selectedModule ? `${selectedModule.emoji} ${selectedModule.title}` : ''}
            onClose={() => setShowLessonModal(false)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FormField label="Dars nomi *">
                <input
                  type="text" placeholder="Dars nomi" value={lessonForm.title}
                  onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="input"
                />
              </FormField>
              <FormField label="Qisqa tavsif">
                <input
                  type="text" placeholder="Dars haqida..." value={lessonForm.description}
                  onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                  className="input"
                />
              </FormField>
              <FormField label={<span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Video size={13} color="var(--accent)" /> Video URL (YouTube)</span>}>
                <input
                  type="url" placeholder="https://www.youtube.com/watch?v=..."
                  value={lessonForm.video_url}
                  onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  className="input"
                />
              </FormField>
              <FormField label={<span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><BookOpen size={13} /> Dars matni</span>}>
                <textarea
                  placeholder="Dars matni..." value={lessonForm.content}
                  onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
                  className="input" rows={3} style={{ resize: 'none' }}
                />
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label={<span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} /> Davomiylik (daq)</span>}>
                  <input
                    type="number" value={lessonForm.duration_min}
                    onChange={e => setLessonForm({ ...lessonForm, duration_min: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </FormField>
                <FormField label={<span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Zap size={13} color="var(--gold)" /> XP mukofot</span>}>
                  <input
                    type="number" value={lessonForm.xp_reward}
                    onChange={e => setLessonForm({ ...lessonForm, xp_reward: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </FormField>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div
                  onClick={() => setLessonForm({ ...lessonForm, is_premium: !lessonForm.is_premium })}
                  style={{
                    width: 42, height: 24, borderRadius: 50,
                    background: lessonForm.is_premium ? 'var(--gold)' : 'var(--surface2)',
                    border: '1px solid var(--border)', position: 'relative', transition: 'all 0.2s', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 2, left: lessonForm.is_premium ? 20 : 2,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'white', transition: 'left 0.2s',
                  }} />
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text)' }}>
                  <Crown size={15} color="var(--gold)" /> Premium dars
                </span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowLessonModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Bekor</button>
              <button onClick={createLesson} disabled={saving} className="btn btn-primary" style={{ flex: 1, background: 'var(--green)' }}>
                {saving ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : '+ Qo\'shish'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: 16, zIndex: 50, overflowY: 'auto',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 20, padding: 20, width: '100%', maxWidth: 480,
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>{title}</p>
            {subtitle && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10, border: 'none',
              background: 'var(--surface2)', color: 'var(--text3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 7 }}>
        {label}
      </label>
      {children}
    </div>
  )
}
