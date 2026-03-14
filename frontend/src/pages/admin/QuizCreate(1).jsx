import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Check, X } from 'lucide-react'
import { adminAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'

export default function QuizCreate() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [step, setStep] = useState(1) // 1: quiz info, 2: add questions
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

  useEffect(() => {
    loadModules()
  }, [])

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
      allLessons.push({
        ...l,
        moduleEmoji: m.emoji,
        moduleTitle: m.title
      })
    })
  })

  const createQuiz = async () => {
    if (!quizForm.lesson_id || !quizForm.title) {
      return alert('Dars va quiz nomini kiriting')
    }
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
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correct_index: 0
      })
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    }
  }

  const finish = () => {
    if (questions.length === 0) {
      return alert('Kamida bitta savol qo\'shing')
    }
    navigate('/admin/quizzes')
  }

  if (!user?.is_admin) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-xl">Ruxsat yo'q</p>
      </div>
    )
  }

  if (loading) return <Loader />

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/quizzes')}
          className="p-2 bg-slate-800 rounded-xl"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Yangi Quiz</h1>
          <p className="text-slate-400 text-sm">
            {step === 1 ? 'Quiz ma\'lumotlari' : `Savollar (${questions.length} ta)`}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-6">
        <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`} />
        <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`} />
      </div>

      {step === 1 ? (
        /* Step 1: Quiz Info */
        <div className="bg-slate-800 rounded-2xl p-5">
          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Dars tanlang *</label>
              <select
                value={quizForm.lesson_id}
                onChange={e => setQuizForm({ ...quizForm, lesson_id: e.target.value })}
                className="w-full bg-slate-700 rounded-xl p-3 text-white"
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
              <label className="text-slate-400 text-sm block mb-2">Quiz nomi *</label>
              <input
                type="text"
                placeholder="Masalan: Algebra test"
                value={quizForm.title}
                onChange={e => setQuizForm({ ...quizForm, title: e.target.value })}
                className="w-full bg-slate-700 rounded-xl p-3 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Vaqt (soniya)</label>
                <input
                  type="number"
                  value={quizForm.time_limit}
                  onChange={e => setQuizForm({ ...quizForm, time_limit: parseInt(e.target.value) || 120 })}
                  className="w-full bg-slate-700 rounded-xl p-3 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">O'tish bali (%)</label>
                <input
                  type="number"
                  value={quizForm.passing_score}
                  onChange={e => setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value) || 70 })}
                  className="w-full bg-slate-700 rounded-xl p-3 text-white"
                />
              </div>
            </div>
          </div>

          <button
            onClick={createQuiz}
            disabled={creating}
            className="w-full mt-6 py-4 bg-blue-500 rounded-xl font-bold text-white disabled:opacity-50"
          >
            {creating ? 'Yaratilmoqda...' : 'Davom etish'}
          </button>
        </div>
      ) : (
        /* Step 2: Add Questions */
        <div className="space-y-4">
          {/* Added questions */}
          {questions.length > 0 && (
            <div className="bg-slate-800 rounded-2xl p-4 space-y-2">
              <p className="text-slate-400 text-sm mb-2">Qo'shilgan savollar:</p>
              {questions.map((q, idx) => (
                <div key={idx} className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-white text-sm">
                    <span className="text-blue-400 font-bold mr-2">{idx + 1}.</span>
                    {q.question}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add new question */}
          <div className="bg-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-4">Yangi savol</h3>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Savol *</label>
                <textarea
                  placeholder="Savolni kiriting..."
                  value={questionForm.question}
                  onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
                  className="w-full bg-slate-700 rounded-xl p-3 text-white"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm block mb-2">Javob variantlari</label>
                {questionForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setQuestionForm({ ...questionForm, correct_index: idx })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                        questionForm.correct_index === idx
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-600 text-slate-400'
                      }`}
                    >
                      {questionForm.correct_index === idx ? <Check size={16} /> : String.fromCharCode(65 + idx)}
                    </button>
                    <input
                      type="text"
                      placeholder={`Variant ${String.fromCharCode(65 + idx)}`}
                      value={opt}
                      onChange={e => {
                        const newOpts = [...questionForm.options]
                        newOpts[idx] = e.target.value
                        setQuestionForm({ ...questionForm, options: newOpts })
                      }}
                      className="flex-1 bg-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                ))}
                <p className="text-green-400 text-xs mt-2">
                  To'g'ri javob: {String.fromCharCode(65 + questionForm.correct_index)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addQuestion}
                className="flex-1 py-3 bg-green-500 rounded-xl font-bold text-white flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Qo'shish
              </button>
            </div>
          </div>

          {/* Finish button */}
          <button
            onClick={finish}
            className="w-full py-4 bg-blue-500 rounded-xl font-bold text-white"
          >
            Tugatish ({questions.length} ta savol)
          </button>
        </div>
      )}
    </div>
  )
}
