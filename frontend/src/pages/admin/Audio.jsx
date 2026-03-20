import { useState, useEffect } from 'react'
import { Plus, Trash2, Crown, ChevronDown, ChevronUp, ChevronLeft, X, Upload, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../../api'

const emptyCategory = { title: '', description: '', emoji: '🎧', order_index: 0 }
const emptyAudio = {
  title: '', description: '', audio_url: '', cover_url: '',
  duration_sec: 0, author: '', language: '', is_premium: false, order_index: 0
}

const inp = {
  width: '100%', padding: '10px 12px',
  background: 'var(--bg2)', border: '1.5px solid var(--border)',
  borderRadius: 10, color: 'var(--text)', fontSize: 14, outline: 'none',
  fontFamily: 'var(--font)', boxSizing: 'border-box',
}

export default function AdminAudio() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [audios, setAudios] = useState({})           // { catId: [...] }
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const [showCatModal, setShowCatModal] = useState(false)
  const [catForm, setCatForm] = useState(emptyCategory)

  const [showAudioModal, setShowAudioModal] = useState(false)
  const [selectedCat, setSelectedCat] = useState(null)
  const [audioForm, setAudioForm] = useState(emptyAudio)

  const [audioFile, setAudioFile] = useState(null)
  const [audioUploading, setAudioUploading] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)

  const loadCategories = async () => {
    try {
      const res = await adminAPI.getAudioCategories()
      setCategories(res.data)
    } finally {
      setLoading(false)
    }
  }

  const loadAudios = async (catId) => {
    const res = await adminAPI.getCategoryAudios(catId)
    setAudios(prev => ({ ...prev, [catId]: res.data }))
  }

  useEffect(() => { loadCategories() }, [])

  const toggleExpand = async (catId) => {
    if (expanded === catId) { setExpanded(null); return }
    setExpanded(catId)
    if (!audios[catId]) await loadAudios(catId)
  }

  // Category CRUD
  const createCategory = async () => {
    if (!catForm.title.trim()) return alert('Kategoriya nomini kiriting')
    await adminAPI.createAudioCategory(catForm)
    setShowCatModal(false)
    setCatForm(emptyCategory)
    loadCategories()
  }

  const deleteCategory = async (id) => {
    if (!confirm("Kategoriyani va barcha audiolarni o'chirishni tasdiqlaysizmi?")) return
    await adminAPI.deleteAudioCategory(id)
    loadCategories()
  }

  // Audio CRUD
  const openAudioModal = (cat) => {
    setSelectedCat(cat)
    setAudioForm(emptyAudio)
    setAudioFile(null)
    setAudioProgress(0)
    setShowAudioModal(true)
  }

  const handleAudioFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAudioFile(file)
    setAudioUploading(true)
    setAudioProgress(0)
    try {
      const res = await adminAPI.uploadAudio(file, (evt) => {
        if (evt.total) setAudioProgress(Math.round((evt.loaded / evt.total) * 100))
      })
      setAudioForm(f => ({ ...f, audio_url: res.data.url }))
    } catch {
      alert("Audio yuklashda xatolik")
      setAudioFile(null)
    } finally {
      setAudioUploading(false)
    }
  }

  const createAudio = async () => {
    if (!audioForm.title.trim()) return alert('Audio nomini kiriting')
    if (!audioForm.audio_url.trim()) return alert('Audio faylni yuklang yoki URL kiriting')
    await adminAPI.createAudio({ ...audioForm, category_id: selectedCat.id })
    setShowAudioModal(false)
    loadAudios(selectedCat.id)
  }

  const deleteAudio = async (catId, audioId) => {
    if (!confirm("Audioni o'chirishni tasdiqlaysizmi?")) return
    await adminAPI.deleteAudio(audioId)
    loadAudios(catId)
  }

  const formatDuration = (sec) => {
    if (!sec) return '0:00'
    const m = Math.floor(sec / 60), s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  if (loading) return <div className="loader-full"><div className="spinner" /></div>

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('/admin')}
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={18} style={{ color: 'var(--text)' }} />
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>🎧 Audio Darsliklar</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>{categories.length} ta kategoriya</p>
          </div>
        </div>
        <button onClick={() => setShowCatModal(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Plus size={15} /> Kategoriya
        </button>
      </div>

      {/* Categories list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {categories.map(cat => (
          <div key={cat.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{ padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onClick={() => toggleExpand(cat.id)}
            >
              <span style={{ fontSize: 24 }}>{cat.emoji}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{cat.title}</span>
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {audios[cat.id] ? `${audios[cat.id].length} ta audio` : 'Ko\'rish uchun bosing'}
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); openAudioModal(cat) }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '5px 8px' }}
                title="Audio qo'shish"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); deleteCategory(cat.id) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 6px', color: 'var(--red)' }}
                title="Kategoriyani o'chirish"
              >
                <Trash2 size={15} />
              </button>
              {expanded === cat.id
                ? <ChevronUp size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                : <ChevronDown size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />
              }
            </div>

            {expanded === cat.id && (
              <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)', padding: '10px 12px' }}>
                {(audios[cat.id] || []).length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '12px 0' }}>
                    Hozircha audio yo'q. + tugmasini bosib qo'shing
                  </p>
                ) : (
                  (audios[cat.id] || []).map((a, idx) => (
                    <div key={a.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                      background: 'var(--surface)', borderRadius: 8, marginBottom: 6,
                      border: '1px solid var(--border)',
                    }}>
                      <span style={{ color: 'var(--text3)', fontSize: 12, width: 20, flexShrink: 0 }}>{idx + 1}.</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{a.title}</p>
                          {a.is_premium && <Crown size={11} style={{ color: 'var(--gold)' }} />}
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                          {a.author && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{a.author}</span>}
                          {a.duration_sec > 0 && <span style={{ fontSize: 11, color: 'var(--text3)' }}>⏱ {formatDuration(a.duration_sec)}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteAudio(cat.id, a.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--red)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 32, marginBottom: 10 }}>🎧</p>
            <p style={{ color: 'var(--text3)', fontSize: 14 }}>Hali kategoriya yo'q. Qo'shish uchun "Kategoriya" tugmasini bosing</p>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <p className="modal-title" style={{ margin: 0 }}>🎧 Yangi kategoriya</p>
              <button onClick={() => setShowCatModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: 'var(--text3)' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="input-label">Nomi *</label>
                <input style={inp} placeholder="Masalan: Ingliz tili Listening" value={catForm.title} onChange={e => setCatForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Tavsif</label>
                <textarea style={{ ...inp, minHeight: 64, resize: 'vertical' }} placeholder="Kategoriya haqida..." value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="input-label">Emoji</label>
                  <input style={inp} placeholder="🎧" value={catForm.emoji} onChange={e => setCatForm(f => ({ ...f, emoji: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Tartib raqami</label>
                  <input style={inp} type="number" value={catForm.order_index} onChange={e => setCatForm(f => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowCatModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Bekor</button>
              <button onClick={createCategory} className="btn btn-primary" style={{ flex: 1 }}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Modal */}
      {showAudioModal && (
        <div className="modal-overlay" onClick={() => setShowAudioModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <p className="modal-title" style={{ margin: 0 }}>🎵 Yangi audio</p>
              <button onClick={() => setShowAudioModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: 'var(--text3)' }} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>{selectedCat?.emoji} {selectedCat?.title}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="input-label">Audio nomi *</label>
                <input style={inp} placeholder="Masalan: Unit 1 - Listening" value={audioForm.title} onChange={e => setAudioForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              <div>
                <label className="input-label">Audio fayl yuklash</label>
                <label style={{ display: 'block', cursor: 'pointer' }}>
                  <div style={{
                    border: `2px dashed ${audioForm.audio_url ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: 10, padding: '14px', textAlign: 'center',
                    background: audioForm.audio_url ? 'var(--green-dim)' : 'var(--bg2)',
                  }}>
                    {audioUploading ? (
                      <div>
                        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>Yuklanmoqda... {audioProgress}%</p>
                        <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${audioProgress}%`, background: 'var(--primary)', transition: 'width 0.2s' }} />
                        </div>
                      </div>
                    ) : audioForm.audio_url ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <CheckCircle size={16} style={{ color: 'var(--green)' }} />
                        <p style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>{audioFile?.name || 'Audio yuklandi'}</p>
                      </div>
                    ) : (
                      <div>
                        <Upload size={22} style={{ color: 'var(--text3)', margin: '0 auto 6px' }} />
                        <p style={{ fontSize: 13, color: 'var(--text3)' }}>Audio faylni tanlang</p>
                        <p style={{ fontSize: 11, color: 'var(--text3)', opacity: 0.7, marginTop: 3 }}>MP3, WAV, OGG, M4A, AAC</p>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="audio/*" onChange={handleAudioFileSelect} style={{ display: 'none' }} disabled={audioUploading} />
                </label>
                {audioForm.audio_url && (
                  <button
                    onClick={() => { setAudioFile(null); setAudioForm(f => ({ ...f, audio_url: '' })) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--red)', marginTop: 4 }}
                  >
                    × Audio faylni o'chirish
                  </button>
                )}
              </div>

              <div>
                <label className="input-label">Yoki audio URL kiriting</label>
                <input style={inp} placeholder="https://..." value={audioForm.audio_url} onChange={e => setAudioForm(f => ({ ...f, audio_url: e.target.value }))} />
              </div>

              <div>
                <label className="input-label">Muqova rasmi URL (ixtiyoriy)</label>
                <input style={inp} placeholder="https://..." value={audioForm.cover_url} onChange={e => setAudioForm(f => ({ ...f, cover_url: e.target.value }))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="input-label">Muallif</label>
                  <input style={inp} placeholder="Ism Familiya" value={audioForm.author} onChange={e => setAudioForm(f => ({ ...f, author: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Til</label>
                  <input style={inp} placeholder="Ingliz tili" value={audioForm.language} onChange={e => setAudioForm(f => ({ ...f, language: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="input-label">Davomiylik (soniya)</label>
                  <input style={inp} type="number" placeholder="180" value={audioForm.duration_sec || ''} onChange={e => setAudioForm(f => ({ ...f, duration_sec: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="input-label">Tartib raqami</label>
                  <input style={inp} type="number" value={audioForm.order_index} onChange={e => setAudioForm(f => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>
                <input type="checkbox" checked={audioForm.is_premium} onChange={e => setAudioForm(f => ({ ...f, is_premium: e.target.checked }))} />
                <Crown size={14} style={{ color: 'var(--gold)' }} /> Premium audio
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowAudioModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Bekor</button>
              <button onClick={createAudio} className="btn btn-primary" style={{ flex: 1 }}>Qo'shish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
