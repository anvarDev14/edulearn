import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Check, X, Clock, Target, HelpCircle, BookOpen, Loader2, CheckCircle2 } from 'lucide-react'
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
  const [addingQ, setAddingQ] = useState(false)

  const [quizForm, setQuizForm] = useState({
    lesson_id: '', title: '', time_limit: 120, passing_score: 70
  })

  const [questionForm, setQuestionForm] = useState({
    question: '', options: ['', '', '', ''], correct_index: 0
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
    } finally { setCreating(false) }
  }

  const addQuestion = async () => {
    if (!questionForm.question || questionForm.options.some(o => !o.trim()))
      return alert('Savol va barcha variantlarni kiriting')
    setAddingQ(true)
    try {
      await adminAPI.addQuestion(createdQuiz.id, questionForm)
      setQuestions(prev => [...prev, { ...questionForm }])
      setQuestionForm({ question: '', options: ['', '', '', ''], correct_index: 0 })
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    } finally { setAddingQ(false) }
  }

  const finish = () => {
    if (questions.length === 0) return alert("Kamida bitta savol qo'shing")
    navigate('/admin/quizzes')
  }

  if (!user?.is_admin) return (
    <div style={{ padding: 24, textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
      <p style={{ color: 'var(--red)', fontWeight: 600 }}>Ruxsat yo'q</p>
    </div>
  )

  if (loading) return <Loader />

  return (
    <div style={{ padding: '20px 0', paddingBottom: 96 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/admin/quizzes')}
          style={{
            width: 40, height: 40, borderRadius: 12, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Yangi Quiz</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>
            {step === 1 ? "Quiz ma'lumotlarini kiriting" : `Savollar qo'shilmoqda (${questions.length} ta)`}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center' }}>
        <StepDot num={1} active={step >= 1} done={step > 1} label="Quiz ma'lumotlari" />
        <div style={{
          flex: 1, height: 2, borderRadius: 2,
          background: step >= 2 ? 'var(--primary)' : 'var(--border)',
          transition: 'background 0.3s',
        }} />
        <StepDot num={2} active={step >= 2} done={false} label="Savollar" />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 20, padding: 20,
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 20 }}>
                Quiz ma'lumotlari
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FormField label={<span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><BookOpen size={12} /> Dars tanlang *</span>}>
                  <select
                    value={quizForm.lesson_id}
                    onChange={e => setQuizForm({ ...quizForm, lesson_id: e.target.value })}
                    className="input"
                    style={{ appearance: 'auto' }}
                  >
                    <option value="">Dars tanlang...</option>
                    {allLessons.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.moduleEmoji} {l.title}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label={<span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><HelpCircle size={12} /> Quiz nomi *</span>}>
                  <input
                    type="text" placeholder="Masalan: Algebra test"
                    value={quizForm.title}
                    onChange={e => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="input"
                  />
                </FormField>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <FormField label={<span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={12} /> Vaqt (soniya)</span>}>
                    <input
                      type="number" value={quizForm.time_limit}
                      onChange={e => setQuizForm({ ...quizForm, time_limit: parseInt(e.target.value) || 120 })}
                      className="input"
                    />
                  </FormField>
                  <FormField label={<span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Target size={12} /> O'tish bali (%)</span>}>
                    <input
                      type="number" value={quizForm.passing_score}
                      onChange={e => setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value) || 70 })}
                      className="input"
                    />
                  </FormField>
                </div>

                {/* Summary */}
                {(quizForm.lesson_id || quizForm.title) && (
                  <div style={{
                    background: 'var(--primary-dim)', borderRadius: 12, padding: '12px 14px',
                    border: '1px solid rgba(37,99,235,0.2)',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}>
                    <HelpCircle size={16} color="var(--primary-light)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                      {quizForm.title && <p style={{ fontWeight: 600 }}>{quizForm.title}</p>}
                      <p style={{ color: 'var(--text3)', marginTop: 2 }}>
                        {Math.floor(quizForm.time_limit / 60)} daq · O'tish: {quizForm.passing_score}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={createQuiz}
                disabled={creating || !quizForm.lesson_id || !quizForm.title}
                className="btn btn-primary btn-full"
                style={{ marginTop: 24, height: 48, borderRadius: 14, fontSize: 15 }}
              >
                {creating
                  ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
                  : 'Davom etish →'
                }
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Added questions */}
            {questions.length > 0 && (
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 16, padding: 16,
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 12 }}>
                  Qo'shilgan savollar ({questions.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {questions.map((q, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px',
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                        background: 'var(--green-dim)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CheckCircle2 size={14} color="var(--green)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{q.question}</p>
                        <p style={{ fontSize: 11, color: 'var(--green)', marginTop: 3 }}>
                          To'g'ri: {q.options[q.correct_index]}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Add new question */}
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 20, padding: 20,
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 20 }}>
                Yangi savol
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FormField label="Savol *">
                  <textarea
                    placeholder="Savolni kiriting..."
                    value={questionForm.question}
                    onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
                    className="input" rows={2} style={{ resize: 'none' }}
                  />
                </FormField>

                <FormField label="Javob variantlari">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {questionForm.options.map((opt, idx) => {
                      const isCorrect = questionForm.correct_index === idx
                      const letters = ['A', 'B', 'C', 'D']
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => setQuestionForm({ ...questionForm, correct_index: idx })}
                            style={{
                              width: 34, height: 34, borderRadius: 10, border: 'none',
                              background: isCorrect ? 'var(--green)' : 'var(--surface2)',
                              color: isCorrect ? 'white' : 'var(--text3)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', fontWeight: 700, fontSize: 13, flexShrink: 0,
                              transition: 'all 0.2s',
                              boxShadow: isCorrect ? '0 2px 10px rgba(34,197,94,0.35)' : 'none',
                            }}
                          >
                            {isCorrect ? <Check size={15} /> : letters[idx]}
                          </button>
                          <input
                            type="text"
                            placeholder={`${letters[idx]} varianti`}
                            value={opt}
                            onChange={e => {
                              const newOpts = [...questionForm.options]
                              newOpts[idx] = e.target.value
                              setQuestionForm({ ...questionForm, options: newOpts })
                            }}
                            className="input"
                            style={{
                              borderColor: isCorrect ? 'var(--green)' : undefined,
                              background: isCorrect ? 'var(--green-dim)' : undefined,
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--green)', marginTop: 8, fontWeight: 600 }}>
                    ✓ To'g'ri javob: {['A', 'B', 'C', 'D'][questionForm.correct_index]}
                  </p>
                </FormField>
              </div>

              <button
                onClick={addQuestion}
                disabled={addingQ}
                className="btn btn-full"
                style={{
                  marginTop: 20, height: 46, borderRadius: 13,
                  background: 'var(--green-dim)', color: 'var(--green)',
                  fontSize: 14, fontWeight: 700, border: 'none',
                }}
              >
                {addingQ
                  ? <Loader2 size={17} style={{ animation: 'spin 0.8s linear infinite' }} />
                  : <><Plus size={17} /> Savol qo'shish</>
                }
              </button>
            </div>

            {/* Finish button */}
            <button
              onClick={finish}
              disabled={questions.length === 0}
              className="btn btn-primary btn-full"
              style={{ height: 52, borderRadius: 16, fontSize: 15 }}
            >
              <CheckCircle2 size={18} />
              Tugatish ({questions.length} ta savol)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StepDot({ num, active, done, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', border: 'none',
        background: done ? 'var(--green)' : active ? 'var(--primary)' : 'var(--surface2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s',
        boxShadow: active ? '0 2px 12px rgba(37,99,235,0.4)' : 'none',
      }}>
        {done
          ? <Check size={15} color="white" />
          : <span style={{ fontSize: 13, fontWeight: 700, color: active ? 'white' : 'var(--text3)' }}>{num}</span>
        }
      </div>
      <span style={{ fontSize: 10, color: active ? 'var(--primary-light)' : 'var(--text3)', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text3)',
        textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 7
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}
