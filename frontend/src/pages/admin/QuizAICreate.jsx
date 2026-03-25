import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Sparkles, Check, Edit3, Trash2, Loader2, AlertCircle, Plus } from 'lucide-react'
import { adminAPI } from '../../api'
import Loader from '../../components/common/Loader'

export default function QuizAICreate() {
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)   // 1: config | 2: review
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [editingIdx, setEditingIdx] = useState(null)
  const [lessonTitle, setLessonTitle] = useState('')

  const [config, setConfig] = useState({
    lesson_id: '',
    quiz_title: '',
    question_count: 5,
    difficulty: 'medium',
    time_limit: 300,
    passing_score: 70,
    extra_context: ''
  })

  useEffect(() => {
    adminAPI.getModules()
      .then(r => setModules(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const allLessons = []
  modules.forEach(m => {
    m.lessons?.forEach(l => {
      allLessons.push({ ...l, moduleEmoji: m.emoji, moduleTitle: m.title })
    })
  })

  const handleGenerate = async () => {
    if (!config.lesson_id) return alert('Dars tanlang')
    if (!config.quiz_title.trim()) return alert('Quiz nomini kiriting')

    setGenerating(true)
    try {
      const res = await adminAPI.generateQuizAI({
        lesson_id: parseInt(config.lesson_id),
        question_count: config.question_count,
        difficulty: config.difficulty,
        extra_context: config.extra_context || null
      })
      setGeneratedQuestions(res.data.questions)
      setLessonTitle(res.data.lesson_title)
      setStep(2)
    } catch (e) {
      alert(e.response?.data?.detail || 'AI bilan xatolik yuz berdi')
    } finally {
      setGenerating(false)
    }
  }

  const updateQuestion = (idx, field, value) => {
    setGeneratedQuestions(prev => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      return updated
    })
  }

  const updateOption = (qIdx, optIdx, value) => {
    setGeneratedQuestions(prev => {
      const updated = [...prev]
      const opts = [...updated[qIdx].options]
      opts[optIdx] = value
      updated[qIdx] = { ...updated[qIdx], options: opts }
      return updated
    })
  }

  const deleteQuestion = (idx) => {
    if (generatedQuestions.length <= 1) return alert('Kamida 1 ta savol bo\'lishi kerak')
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  const addEmptyQuestion = () => {
    setGeneratedQuestions(prev => [...prev, {
      id: Date.now(),
      question: '',
      options: ['', '', '', ''],
      correct_index: 0,
      explanation: ''
    }])
    setEditingIdx(generatedQuestions.length)
  }

  const saveQuiz = async () => {
    for (const q of generatedQuestions) {
      if (!q.question.trim()) return alert('Barcha savollarni to\'ldiring')
      if (q.options.some(o => !o.trim())) return alert('Barcha variantlarni to\'ldiring')
    }

    setSaving(true)
    try {
      // Create quiz
      const quizRes = await adminAPI.createQuiz({
        lesson_id: parseInt(config.lesson_id),
        title: config.quiz_title,
        time_limit_sec: config.time_limit,
        pass_percentage: config.passing_score
      })

      // Add questions
      for (let i = 0; i < generatedQuestions.length; i++) {
        const q = generatedQuestions[i]
        await adminAPI.addQuestion(quizRes.data.id, {
          question_text: q.question,
          question_type: 'multiple_choice',
          options: q.options,
          correct_answer: q.options[q.correct_index],
          explanation: q.explanation || null,
          order_index: i
        })
      }

      alert(`✅ Quiz muvaffaqiyatli yaratildi! (${generatedQuestions.length} ta savol)`)
      navigate('/admin/quizzes')
    } catch (e) {
      alert('Xatolik: ' + (e.response?.data?.detail || 'Server xatosi'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  const inp = {
    width: '100%', padding: '10px 12px',
    background: 'var(--bg2)', border: '1.5px solid var(--border)',
    borderRadius: 10, color: 'var(--text)', fontSize: 14,
    outline: 'none', fontFamily: 'var(--font)', boxSizing: 'border-box'
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => step === 2 ? setStep(1) : navigate('/admin/quizzes')}
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
            {step === 1 ? 'Dars va sozlamalarni tanlang' : `${lessonTitle} — ${generatedQuestions.length} ta savol`}
          </p>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[1, 2].map(s => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: step >= s ? 'var(--primary)' : 'var(--border)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>

      {/* ── Step 1: Config ── */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Lesson select */}
          <div className="card">
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>Dars *</p>
            <select
              value={config.lesson_id}
              onChange={e => setConfig({ ...config, lesson_id: e.target.value })}
              style={{ ...inp, cursor: 'pointer' }}
            >
              <option value="">Dars tanlang...</option>
              {allLessons.map(l => (
                <option key={l.id} value={l.id}>{l.moduleEmoji} {l.moduleTitle} → {l.title}</option>
              ))}
            </select>
          </div>

          {/* Quiz title */}
          <div className="card">
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>Quiz nomi *</p>
            <input
              style={inp}
              placeholder="Masalan: Algebra — 1-bo'lim testi"
              value={config.quiz_title}
              onChange={e => setConfig({ ...config, quiz_title: e.target.value })}
            />
          </div>

          {/* Question count + difficulty */}
          <div className="card">
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>Savollar soni</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[3, 5, 7, 10].map(n => (
                <button key={n} onClick={() => setConfig({ ...config, question_count: n })} style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  background: config.question_count === n ? 'var(--primary)' : 'var(--bg2)',
                  color: config.question_count === n ? '#fff' : 'var(--text3)',
                  border: `1.5px solid ${config.question_count === n ? 'var(--primary)' : 'var(--border)'}`,
                }}>{n}</button>
              ))}
            </div>

            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>Qiyinlik</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { v: 'easy', l: '🟢 Oson' },
                { v: 'medium', l: '🟡 O\'rtacha' },
                { v: 'hard', l: '🔴 Qiyin' }
              ].map(d => (
                <button key={d.v} onClick={() => setConfig({ ...config, difficulty: d.v })} style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  background: config.difficulty === d.v ? 'var(--primary)' : 'var(--bg2)',
                  color: config.difficulty === d.v ? '#fff' : 'var(--text3)',
                  border: `1.5px solid ${config.difficulty === d.v ? 'var(--primary)' : 'var(--border)'}`,
                }}>{d.l}</button>
              ))}
            </div>
          </div>

          {/* Time + passing score */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', marginBottom: 8 }}>Vaqt (soniya)</p>
              <input style={inp} type="number" value={config.time_limit}
                onChange={e => setConfig({ ...config, time_limit: parseInt(e.target.value) || 300 })} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', marginBottom: 8 }}>O'tish bali (%)</p>
              <input style={inp} type="number" value={config.passing_score}
                onChange={e => setConfig({ ...config, passing_score: parseInt(e.target.value) || 70 })} />
            </div>
          </div>

          {/* Extra context */}
          <div className="card">
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
              AI uchun qo'shimcha ma'lumot <span style={{ fontWeight: 400, textTransform: 'none' }}>(ixtiyoriy)</span>
            </p>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
              Video mavzusi, muhim tushunchalar yoki AI e'tibor berishi kerak bo'lgan narsalarni yozing
            </p>
            <textarea
              style={{ ...inp, resize: 'vertical', minHeight: 72 }}
              placeholder="Masalan: Savollar asosan Python listlar va lug'atlar haqida bo'lsin. For loop va while loop farqiga e'tibor bering."
              value={config.extra_context}
              onChange={e => setConfig({ ...config, extra_context: e.target.value })}
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !config.lesson_id || !config.quiz_title.trim()}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15,
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'white', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: (generating || !config.lesson_id || !config.quiz_title.trim()) ? 0.5 : 1,
            }}
          >
            {generating ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> AI savollar yaratmoqda...</>
            ) : (
              <><Sparkles size={18} /> AI bilan {config.question_count} ta savol yaratish</>
            )}
          </button>

          {generating && (
            <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
              <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>AI tahlil qilmoqda...</p>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>Dars mavzusi bo'yicha savollar generatsiya qilinmoqda</p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Review ── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--primary-dim)', border: '1px solid rgba(var(--primary-rgb),0.2)',
            borderRadius: 12, padding: '12px 14px',
            display: 'flex', alignItems: 'flex-start', gap: 10
          }}>
            <AlertCircle size={18} style={{ color: 'var(--primary)', marginTop: 1, flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>
                {generatedQuestions.length} ta savol yaratildi ✨
              </p>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                Savollarni tekshiring, kerak bo'lsa tahrirlang va saqlang
              </p>
            </div>
          </div>

          {generatedQuestions.map((q, qi) => (
            <div key={q.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 8, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
                  {qi + 1}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => setEditingIdx(editingIdx === qi ? null : qi)}
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer' }}
                  >
                    <Edit3 size={14} style={{ color: 'var(--primary)' }} />
                  </button>
                  <button
                    onClick={() => deleteQuestion(qi)}
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} style={{ color: 'var(--red)' }} />
                  </button>
                </div>
              </div>

              {editingIdx === qi ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea
                    value={q.question}
                    onChange={e => updateQuestion(qi, 'question', e.target.value)}
                    placeholder="Savol matni..."
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 64, fontFamily: 'var(--font)', boxSizing: 'border-box' }}
                  />
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => updateQuestion(qi, 'correct_index', oi)}
                        style={{
                          width: 30, height: 30, borderRadius: 8, flexShrink: 0, cursor: 'pointer',
                          background: q.correct_index === oi ? 'var(--green)' : 'var(--bg2)',
                          border: `1.5px solid ${q.correct_index === oi ? 'var(--green)' : 'var(--border)'}`,
                          color: q.correct_index === oi ? '#fff' : 'var(--text3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700
                        }}
                      >
                        {q.correct_index === oi ? <Check size={13} /> : String.fromCharCode(65 + oi)}
                      </button>
                      <input
                        value={opt}
                        onChange={e => updateOption(qi, oi, e.target.value)}
                        placeholder={`${String.fromCharCode(65 + oi)} varianti...`}
                        style={{ flex: 1, padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)' }}
                      />
                    </div>
                  ))}
                  <input
                    value={q.explanation || ''}
                    onChange={e => updateQuestion(qi, 'explanation', e.target.value)}
                    placeholder="Tushuntirish (ixtiyoriy)..."
                    style={{ padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text3)', fontSize: 12, outline: 'none', fontFamily: 'var(--font)' }}
                  />
                  <button onClick={() => setEditingIdx(null)} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-end' }}>
                    <Check size={14} /> Tayyor
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 10, fontWeight: 600 }}>{q.question || <span style={{ color: 'var(--red)' }}>Savol kiritilmagan</span>}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {q.options.map((opt, oi) => (
                      <p key={oi} style={{
                        fontSize: 12, padding: '6px 10px', borderRadius: 8,
                        background: q.correct_index === oi ? 'var(--green-dim)' : 'var(--bg2)',
                        color: q.correct_index === oi ? 'var(--green)' : 'var(--text3)',
                        border: `1px solid ${q.correct_index === oi ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
                        fontWeight: q.correct_index === oi ? 700 : 400
                      }}>
                        {String.fromCharCode(65 + oi)}) {opt || <span style={{ opacity: 0.4 }}>bo'sh</span>}
                      </p>
                    ))}
                  </div>
                  {q.explanation && (
                    <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, fontStyle: 'italic' }}>
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add question manually */}
          <button
            onClick={addEmptyQuestion}
            style={{ background: 'none', border: '1.5px dashed var(--border)', borderRadius: 12, padding: '12px', cursor: 'pointer', color: 'var(--text3)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Plus size={15} /> Qo'lda savol qo'shish
          </button>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
              ← Orqaga
            </button>
            <button
              onClick={saveQuiz}
              disabled={saving}
              className="btn btn-primary"
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.6 : 1 }}
            >
              {saving
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saqlanmoqda...</>
                : <><Check size={16} /> Quizni saqlash ({generatedQuestions.length} savol)</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
