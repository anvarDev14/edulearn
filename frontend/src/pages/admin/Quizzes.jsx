import { useState, useEffect } from 'react'
import { Plus, Trash2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { adminAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'
import { AdminBottomNav } from './Dashboard'

export default function AdminQuizzes() {
  const { user } = useAuth()
  const [modules, setModules] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [expandedQuiz, setExpandedQuiz] = useState(null)

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
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await adminAPI.getModules()
      setModules(res.data)
      // Quizlarni yuklash
      try {
        const quizRes = await adminAPI.getQuizzes()
        setQuizzes(quizRes.data || [])
      } catch (e) {
        setQuizzes([])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Barcha darslarni olish
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
    try {
      const res = await adminAPI.createQuiz(quizForm)
      setSelectedQuiz(res.data)
      setShowQuizModal(false)
      setShowQuestionModal(true)
      setQuizForm({ lesson_id: '', title: '', time_limit: 120, passing_score: 70 })
      alert('Quiz yaratildi! Endi savollar qo\'shing.')
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    }
  }

  const addQuestion = async () => {
    if (!questionForm.question || questionForm.options.some(o => !o.trim())) {
      return alert('Savol va barcha variantlarni kiriting')
    }
    try {
      await adminAPI.addQuestion(selectedQuiz.id, questionForm)
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correct_index: 0
      })
      alert('Savol qo\'shildi! Yana savol qo\'shishingiz mumkin.')
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    }
  }

  const deleteQuiz = async (id) => {
    if (!confirm("Quizni o'chirishni xohlaysizmi?")) return
    try {
      await adminAPI.deleteQuiz(id)
      loadData()
    } catch (error) {
      alert('Xatolik')
    }
  }

  const openAddQuestion = (quiz) => {
    setSelectedQuiz(quiz)
    setQuestionForm({ question: '', options: ['', '', '', ''], correct_index: 0 })
    setShowQuestionModal(true)
  }

  if (!user?.is_admin) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-xl">🚫 Ruxsat yo'q</p>
      </div>
    )
  }

  if (loading) return <Loader />

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">📝 Quizlar</h1>
        <button
          onClick={() => setShowQuizModal(true)}
          className="bg-blue-500 px-3 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={20} className="text-white" />
          <span className="text-white text-sm">Quiz</span>
        </button>
      </div>

      {/* Mavjud quizlar */}
      {quizzes.length > 0 ? (
        <div className="space-y-4 mb-6">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="bg-slate-800 rounded-xl overflow-hidden">
              <div
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}
              >
                <HelpCircle className="text-purple-500" size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-white">{quiz.title}</p>
                  <p className="text-slate-400 text-sm">
                    {quiz.questions?.length || 0} ta savol • {quiz.time_limit} soniya
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); openAddQuestion(quiz); }}
                  className="p-2 bg-green-500 rounded-lg"
                >
                  <Plus size={16} className="text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteQuiz(quiz.id); }}
                  className="p-2 text-red-500"
                >
                  <Trash2 size={18} />
                </button>
                {expandedQuiz === quiz.id ?
                  <ChevronUp size={20} className="text-slate-400" /> :
                  <ChevronDown size={20} className="text-slate-400" />
                }
              </div>

              {expandedQuiz === quiz.id && quiz.questions?.length > 0 && (
                <div className="border-t border-slate-700 p-4 space-y-2">
                  {quiz.questions.map((q, idx) => (
                    <div key={q.id} className="bg-slate-700 rounded-lg p-3">
                      <p className="text-white text-sm">
                        <span className="text-slate-400">{idx + 1}.</span> {q.question}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        {q.options?.map((opt, optIdx) => (
                          <p key={optIdx} className={`text-xs ${q.correct_index === optIdx ? 'text-green-400' : 'text-slate-400'}`}>
                            {String.fromCharCode(65 + optIdx)}) {opt}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-6xl mb-4">📝</p>
          <p className="text-slate-400">Quizlar yo'q</p>
        </div>
      )}

      {/* Darslar ro'yxati */}
      {allLessons.length === 0 && (
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-center">Avval darslar qo'shing</p>
        </div>
      )}

      {/* Quiz yaratish Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">📝 Yangi Quiz</h2>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Dars tanlang *</label>
                <select
                  value={quizForm.lesson_id}
                  onChange={e => setQuizForm({...quizForm, lesson_id: e.target.value})}
                  className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1"
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
                <label className="text-slate-400 text-sm">Quiz nomi *</label>
                <input
                  type="text"
                  placeholder="Masalan: Algebra test"
                  value={quizForm.title}
                  onChange={e => setQuizForm({...quizForm, title: e.target.value})}
                  className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-sm">Vaqt (soniya)</label>
                  <input
                    type="number"
                    value={quizForm.time_limit}
                    onChange={e => setQuizForm({...quizForm, time_limit: parseInt(e.target.value) || 120})}
                    className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm">O'tish bali (%)</label>
                  <input
                    type="number"
                    value={quizForm.passing_score}
                    onChange={e => setQuizForm({...quizForm, passing_score: parseInt(e.target.value) || 70})}
                    className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowQuizModal(false)}
                className="flex-1 py-3 bg-slate-700 rounded-xl text-white"
              >
                Bekor
              </button>
              <button
                onClick={createQuiz}
                className="flex-1 py-3 bg-blue-500 rounded-xl text-white font-bold"
              >
                Yaratish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Savol qo'shish Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md my-8">
            <h2 className="text-xl font-bold mb-1 text-white">❓ Savol qo'shish</h2>
            <p className="text-slate-400 text-sm mb-4">{selectedQuiz?.title}</p>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Savol *</label>
                <textarea
                  placeholder="Savolni kiriting..."
                  value={questionForm.question}
                  onChange={e => setQuestionForm({...questionForm, question: e.target.value})}
                  className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-2 block">Javob variantlari (to'g'risini belgilang)</label>
                {questionForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={questionForm.correct_index === idx}
                      onChange={() => setQuestionForm({...questionForm, correct_index: idx})}
                      className="w-5 h-5"
                    />
                    <span className={`w-6 text-center font-bold ${
                      questionForm.correct_index === idx ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      placeholder={`Variant ${String.fromCharCode(65 + idx)}`}
                      value={opt}
                      onChange={e => {
                        const newOpts = [...questionForm.options]
                        newOpts[idx] = e.target.value
                        setQuestionForm({...questionForm, options: newOpts})
                      }}
                      className="flex-1 bg-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                ))}
                <p className="text-green-400 text-xs mt-1">
                  ✓ To'g'ri javob: {String.fromCharCode(65 + questionForm.correct_index)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowQuestionModal(false)
                  setSelectedQuiz(null)
                  loadData()
                }}
                className="flex-1 py-3 bg-slate-700 rounded-xl text-white"
              >
                Tugatish
              </button>
              <button
                onClick={addQuestion}
                className="flex-1 py-3 bg-green-500 rounded-xl text-white font-bold"
              >
                Qo'shish +
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  )
}