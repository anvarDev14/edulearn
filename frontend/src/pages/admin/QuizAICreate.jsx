import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Upload, Sparkles, Video, Check, Edit3, Trash2, Play, FileVideo, Loader2, AlertCircle } from 'lucide-react'
import { adminAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'

export default function QuizAICreate() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [videoFile, setVideoFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [editingQuestion, setEditingQuestion] = useState(null)

  const [config, setConfig] = useState({
    lesson_id: '',
    title: '',
    time_limit: 180,
    passing_score: 70,
    question_count: 5,
    difficulty: 'medium'
  })

  useEffect(() => { loadModules() }, [])

  const loadModules = async () => {
    try {
      const res = await adminAPI.getModules()
      setModules(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const allLessons = []
  modules.forEach(m => {
    m.lessons?.forEach(l => {
      allLessons.push({ ...l, moduleEmoji: m.emoji, moduleTitle: m.title })
    })
  })

  const handleVideoUpload = (e) => {
    const file = e.target.files[0]
    if (file) { setVideoFile(file); setVideoUrl('') }
  }

  const handleVideoUrl = (url) => { setVideoUrl(url); setVideoFile(null) }

  const generateQuiz = async () => {
    if (!videoFile && !videoUrl) return alert('Video yuklang yoki URL kiriting')
    if (!config.lesson_id || !config.title) return alert('Dars va quiz nomini kiriting')
    setGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      const mockQuestions = []
      for (let i = 0; i < config.question_count; i++) {
        mockQuestions.push({
          id: i + 1,
          question: `Savol ${i + 1}: Video mazmuniga oid savol?`,
          options: ['To\'g\'ri javob varianti', 'Noto\'g\'ri variant A', 'Noto\'g\'ri variant B', 'Noto\'g\'ri variant C'],
          correct_index: 0,
          explanation: 'AI tomonidan yaratilgan tushuntirish'
        })
      }
      setGeneratedQuestions(mockQuestions)
      setStep(3)
    } catch {
      alert("AI bilan xatolik yuz berdi. Qaytadan urinib ko'ring.")
    } finally {
      setGenerating(false)
    }
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...generatedQuestions]
    updated[index] = { ...updated[index], [field]: value }
    setGeneratedQuestions(updated)
  }

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...generatedQuestions]
    updated[qIndex].options[optIndex] = value
    setGeneratedQuestions(updated)
  }

  const deleteQuestion = (index) => {
    if (generatedQuestions.length <= 1) return alert("Kamida bitta savol bo'lishi kerak")
    setGeneratedQuestions(generatedQuestions.filter((_, i) => i !== index))
  }

  const saveQuiz = async () => {
    setSaving(true)
    try {
      const quizRes = await adminAPI.createQuiz({
        lesson_id: config.lesson_id,
        title: config.title,
        time_limit: config.time_limit,
        passing_score: config.passing_score
      })
      for (const q of generatedQuestions) {
        await adminAPI.addQuestion(quizRes.data.id, {
          question: q.question,
          options: q.options,
          correct_index: q.correct_index
        })
      }
      alert('Quiz muvaffaqiyatli yaratildi!')
      navigate('/admin/quizzes')
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    } finally {
      setSaving(false)
    }
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
    borderRadius: 10, color: 'var(--text)', fontSize: 14,
    outline: 'none', fontFamily: 'var(--font)',
  }

  const difficultyColors = {
    easy: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#16a34a', active: '#16a34a' },
    medium: { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', text: '#ca8a04', active: '#ca8a04' },
    hard: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#dc2626', active: '#dc2626' },
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => navigate('/admin/quizzes')}
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <ChevronLeft size={18} style={{ color: 'var(--text)' }} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
            AI Quiz Yaratish
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>
            {step === 1 && 'Video yuklang'}
            {step === 2 && 'Sozlamalar'}
            {step === 3 && 'Savollarni tekshiring'}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: step >= s ? 'var(--accent)' : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Step 1: Video */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <FileVideo size={16} style={{ color: 'var(--accent)' }} /> Video yuklash
            </p>
            <label style={{ display: 'block', cursor: 'pointer' }}>
              <div style={{
                border: `2px dashed ${videoFile ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 12, padding: '28px 16px', textAlign: 'center',
                background: videoFile ? 'rgba(196,149,106,0.06)' : 'var(--bg2)',
                transition: 'all 0.2s',
              }}>
                {videoFile ? (
                  <>
                    <Video size={36} style={{ color: 'var(--accent)', margin: '0 auto 8px' }} />
                    <p style={{ fontWeight: 600, color: 'var(--accent)', fontSize: 14 }}>{videoFile.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                      {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload size={36} style={{ color: 'var(--text3)', margin: '0 auto 8px' }} />
                    <p style={{ color: 'var(--text3)', fontSize: 14 }}>Video faylni yuklang</p>
                    <p style={{ fontSize: 12, color: 'var(--text3)', opacity: 0.7, marginTop: 4 }}>MP4, MOV, AVI (max 500MB)</p>
                  </>
                )}
              </div>
              <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>yoki</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <div className="card">
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Play size={16} style={{ color: 'var(--red, #e53e3e)' }} /> YouTube URL
            </p>
            <input
              style={inp}
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={e => handleVideoUrl(e.target.value)}
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!videoFile && !videoUrl}
            className="btn btn-full btn-lg"
            style={{ background: 'var(--accent)', color: 'white', opacity: (!videoFile && !videoUrl) ? 0.5 : 1 }}
          >
            Davom etish →
          </button>
        </div>
      )}

      {/* Step 2: Config */}
      {step === 2 && (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="input-label">Dars tanlang *</label>
              <select
                value={config.lesson_id}
                onChange={e => setConfig({ ...config, lesson_id: e.target.value })}
                style={{ ...inp, cursor: 'pointer' }}
              >
                <option value="">Tanlang...</option>
                {allLessons.map(l => (
                  <option key={l.id} value={l.id}>{l.moduleEmoji} {l.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Quiz nomi *</label>
              <input
                style={inp}
                placeholder="Masalan: Algebra test"
                value={config.title}
                onChange={e => setConfig({ ...config, title: e.target.value })}
              />
            </div>

            <div>
              <label className="input-label">Savollar soni</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[3, 5, 7, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setConfig({ ...config, question_count: n })}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, fontWeight: 600, fontSize: 14,
                      cursor: 'pointer', transition: 'all 0.18s',
                      background: config.question_count === n ? 'var(--accent)' : 'var(--bg2)',
                      color: config.question_count === n ? 'white' : 'var(--text2)',
                      border: `1.5px solid ${config.question_count === n ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">Qiyinlik darajasi</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'easy', label: 'Oson' },
                  { value: 'medium', label: "O'rtacha" },
                  { value: 'hard', label: 'Qiyin' }
                ].map(d => {
                  const colors = difficultyColors[d.value]
                  const active = config.difficulty === d.value
                  return (
                    <button
                      key={d.value}
                      onClick={() => setConfig({ ...config, difficulty: d.value })}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 10, fontWeight: 600, fontSize: 13,
                        cursor: 'pointer', transition: 'all 0.18s',
                        background: active ? colors.active : 'var(--bg2)',
                        color: active ? 'white' : colors.text,
                        border: `1.5px solid ${active ? colors.active : colors.border}`,
                      }}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="input-label">Vaqt (soniya)</label>
                <input style={inp} type="number" value={config.time_limit}
                  onChange={e => setConfig({ ...config, time_limit: parseInt(e.target.value) || 180 })} />
              </div>
              <div>
                <label className="input-label">O'tish bali (%)</label>
                <input style={inp} type="number" value={config.passing_score}
                  onChange={e => setConfig({ ...config, passing_score: parseInt(e.target.value) || 70 })} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
              ← Orqaga
            </button>
            <button
              onClick={generateQuiz}
              disabled={generating || !config.lesson_id || !config.title}
              style={{
                flex: 2, padding: '12px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: 'white', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: (generating || !config.lesson_id || !config.title) ? 0.6 : 1,
              }}
            >
              {generating ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Yaratilmoqda...</>
              ) : (
                <><Sparkles size={18} /> AI bilan yaratish</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'rgba(196,149,106,0.1)', border: '1px solid rgba(196,149,106,0.25)',
            borderRadius: 12, padding: '12px 14px',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <AlertCircle size={18} style={{ color: 'var(--accent)', marginTop: 1, flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>AI yaratgan savollar</p>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                Savollarni tekshiring va kerak bo'lsa tahrirlang
              </p>
            </div>
          </div>

          {generatedQuestions.map((q, qIndex) => (
            <div key={q.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{
                  background: 'var(--accent)', color: 'white', borderRadius: 8,
                  padding: '2px 10px', fontSize: 12, fontWeight: 700,
                }}>
                  {qIndex + 1}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => setEditingQuestion(editingQuestion === qIndex ? null : qIndex)}
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer' }}
                  >
                    <Edit3 size={14} style={{ color: 'var(--primary)' }} />
                  </button>
                  <button
                    onClick={() => deleteQuestion(qIndex)}
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} style={{ color: 'var(--red)' }} />
                  </button>
                </div>
              </div>

              {editingQuestion === qIndex ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    value={q.question}
                    onChange={e => updateQuestion(qIndex, 'question', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 64, fontFamily: 'var(--font)' }}
                  />
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => updateQuestion(qIndex, 'correct_index', optIndex)}
                        style={{
                          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                          background: q.correct_index === optIndex ? 'var(--green)' : 'var(--bg2)',
                          border: `1.5px solid ${q.correct_index === optIndex ? 'var(--green)' : 'var(--border)'}`,
                          color: q.correct_index === optIndex ? 'white' : 'var(--text3)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700,
                        }}
                      >
                        {q.correct_index === optIndex ? <Check size={13} /> : String.fromCharCode(65 + optIndex)}
                      </button>
                      <input
                        value={opt}
                        onChange={e => updateOption(qIndex, optIndex, e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 10 }}>{q.question}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {q.options.map((opt, optIndex) => (
                      <p key={optIndex} style={{
                        fontSize: 12, padding: '6px 10px', borderRadius: 8,
                        background: q.correct_index === optIndex ? 'var(--green-dim)' : 'var(--bg2)',
                        color: q.correct_index === optIndex ? 'var(--green)' : 'var(--text3)',
                        border: `1px solid ${q.correct_index === optIndex ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
                      }}>
                        {String.fromCharCode(65 + optIndex)}) {opt}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(2)} className="btn btn-secondary" style={{ flex: 1 }}>
              ← Orqaga
            </button>
            <button
              onClick={saveQuiz}
              disabled={saving}
              className="btn btn-primary"
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.6 : 1 }}
            >
              {saving ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saqlanmoqda...</>
              ) : (
                <><Check size={16} /> Saqlash</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
