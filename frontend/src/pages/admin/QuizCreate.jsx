import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Check } from 'lucide-react'
import { adminAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'

export default function QuizCreate() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [step, setStep] = useState(1)
  const [createdQuiz, setCreatedQuiz] = useState(null)
  const [questions, setQuestions] = useState([])

  const [quizForm, setQuizForm] = useState({
    lesson_id: '',
    title: '',
    time_limit: 120,
    passing_score: 70
  })

  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_index: 0
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

  const createQuiz = async () => {
    if (!quizForm.lesson_id || !quizForm.title) return alert('Dars va quiz nomini kiriting')
    setCreating(true)
    try {
      const res = await adminAPI.createQuiz(quizForm)
      setCreatedQuiz(res.data)
      setStep(2)
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    } finally {
      setCreating(false)
    }
  }

  const addQuestion = async () => {
    if (!questionForm.question || questionForm.options.some(o => !o.trim())) {
      return alert('Savol va barcha variantlarni kiriting')
    }
    try {
      await adminAPI.addQuestion(createdQuiz.id, questionForm)
      setQuestions([...questions, { ...questionForm }])
      setQuestionForm({ question: '', options: ['', '', '', ''], correct_index: 0 })
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    }
  }

  const finish = () => {
    if (questions.length === 0) return alert("Kamida bitta savol qo'shing")
    navigate('/admin/quizzes')
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
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Yangi Quiz</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>
            {step === 1 ? "Quiz ma'lumotlari" : `Savollar (${questions.length} ta)`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[1, 2].map(s => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: step >= s ? 'var(--primary)' : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {step === 1 ? (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="input-label">Dars tanlang *</label>
              <select
                value={quizForm.lesson_id}
                onChange={e => setQuizForm({ ...quizForm, lesson_id: e.target.value })}
                style={{ ...inp, cursor: 'pointer' }}
              >
                <option value="">Tanlang...</option>
                {allLessons.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.moduleEmoji} {l.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Quiz nomi *</label>
              <input
                style={inp}
                placeholder="Masalan: Algebra test"
                value={quizForm.title}
                onChange={e => setQuizForm({ ...quizForm, title: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="input-label">Vaqt (soniya)</label>
                <input
                  style={inp} type="number"
                  value={quizForm.time_limit}
                  onChange={e => setQuizForm({ ...quizForm, time_limit: parseInt(e.target.value) || 120 })}
                />
              </div>
              <div>
                <label className="input-label">O'tish bali (%)</label>
                <input
                  style={inp} type="number"
                  value={quizForm.passing_score}
                  onChange={e => setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value) || 70 })}
                />
              </div>
            </div>
          </div>

          <button
            onClick={createQuiz}
            disabled={creating}
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: 20, opacity: creating ? 0.6 : 1 }}
          >
            {creating ? 'Yaratilmoqda...' : 'Davom etish →'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Added questions */}
          {questions.length > 0 && (
            <div className="card" style={{ padding: '14px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
                Qo'shilgan savollar
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {questions.map((q, idx) => (
                  <div key={idx} style={{ background: 'var(--bg2)', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 13, color: 'var(--text)' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 700, marginRight: 6 }}>{idx + 1}.</span>
                      {q.question}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New question form */}
          <div className="card">
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Yangi savol</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="input-label">Savol *</label>
                <textarea
                  style={{ ...inp, minHeight: 72, resize: 'vertical' }}
                  placeholder="Savolni kiriting..."
                  value={questionForm.question}
                  onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">Javob variantlari</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {questionForm.options.map((opt, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setQuestionForm({ ...questionForm, correct_index: idx })}
                        style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: questionForm.correct_index === idx ? 'var(--green)' : 'var(--bg2)',
                          border: `1.5px solid ${questionForm.correct_index === idx ? 'var(--green)' : 'var(--border)'}`,
                          color: questionForm.correct_index === idx ? 'white' : 'var(--text3)',
                          fontWeight: 700, fontSize: 13, transition: 'all 0.18s',
                        }}
                      >
                        {questionForm.correct_index === idx
                          ? <Check size={15} />
                          : String.fromCharCode(65 + idx)
                        }
                      </button>
                      <input
                        style={{ ...inp }}
                        placeholder={`Variant ${String.fromCharCode(65 + idx)}`}
                        value={opt}
                        onChange={e => {
                          const newOpts = [...questionForm.options]
                          newOpts[idx] = e.target.value
                          setQuestionForm({ ...questionForm, options: newOpts })
                        }}
                      />
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'var(--green)', marginTop: 6 }}>
                  ✓ To'g'ri javob: {String.fromCharCode(65 + questionForm.correct_index)}
                </p>
              </div>
            </div>

            <button
              onClick={addQuestion}
              className="btn btn-full"
              style={{ marginTop: 16, background: 'var(--green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Plus size={16} /> Savolni qo'shish
            </button>
          </div>

          {/* Finish */}
          <button
            onClick={finish}
            className="btn btn-primary btn-full btn-lg"
          >
            Tugatish ({questions.length} ta savol)
          </button>
        </div>
      )}
    </div>
  )
}
