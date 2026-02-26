import { useState, useEffect } from 'react'
import { Plus, HelpCircle } from 'lucide-react'
import { adminAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'
import { AdminBottomNav } from './Dashboard'

export default function AdminQuizzes() {
  const { user } = useAuth()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  const [quizForm, setQuizForm] = useState({ lesson_id: '', title: '', time_limit: 120, passing_score: 70 })
  const [questionForm, setQuestionForm] = useState({ question: '', options: ['', '', '', ''], correct_index: 0 })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
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
  modules.forEach(m => m.lessons?.forEach(l => allLessons.push({ ...l, moduleEmoji: m.emoji, moduleTitle: m.title })))

  const createQuiz = async () => {
    if (!quizForm.lesson_id || !quizForm.title) return alert('Dars va quiz nomini kiriting')
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
    if (!questionForm.question || questionForm.options.some(o => !o.trim())) return alert('Savol va barcha variantlarni kiriting')
    try {
      await adminAPI.addQuestion(selectedQuiz.id, questionForm)
      setQuestionForm({ question: '', options: ['', '', '', ''], correct_index: 0 })
      alert('Savol qo\'shildi!')
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
        <h1 className="text-2xl font-bold text-white">📝 Quizlar</h1>
        <button onClick={() => setShowQuizModal(true)} className="bg-blue-500 px-3 py-2 rounded-xl flex items-center gap-2">
          <Plus size={20} className="text-white" />
          <span className="text-white text-sm">Quiz</span>
        </button>
      </div>

      {allLessons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-6xl mb-4">📝</p>
          <p className="text-slate-400">Avval darslar qo'shing</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-white">Jami {allLessons.length} ta dars mavjud</p>
          <p className="text-slate-400 text-sm mt-2">Quiz qo'shish uchun "Quiz" tugmasini bosing</p>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">📝 Yangi Quiz</h2>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Dars tanlang *</label>
                <select value={quizForm.lesson_id} onChange={e => setQuizForm({...quizForm, lesson_id: e.target.value})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1">
                  <option value="">Tanlang...</option>
                  {allLessons.map(l => <option key={l.id} value={l.id}>{l.moduleEmoji} {l.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm">Quiz nomi *</label>
                <input type="text" placeholder="Masalan: Algebra test" value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-sm">Vaqt (soniya)</label>
                  <input type="number" value={quizForm.time_limit} onChange={e => setQuizForm({...quizForm, time_limit: parseInt(e.target.value) || 120})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm">O'tish bali (%)</label>
                  <input type="number" value={quizForm.passing_score} onChange={e => setQuizForm({...quizForm, passing_score: parseInt(e.target.value) || 70})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowQuizModal(false)} className="flex-1 py-3 bg-slate-700 rounded-xl text-white">Bekor</button>
              <button onClick={createQuiz} className="flex-1 py-3 bg-blue-500 rounded-xl text-white font-bold">Yaratish</button>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md my-8">
            <h2 className="text-xl font-bold mb-1 text-white">❓ Savol qo'shish</h2>
            <p className="text-slate-400 text-sm mb-4">{selectedQuiz?.title}</p>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Savol *</label>
                <textarea placeholder="Savolni kiriting..." value={questionForm.question} onChange={e => setQuestionForm({...questionForm, question: e.target.value})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" rows={2} />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-2 block">Javob variantlari</label>
                {questionForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input type="radio" name="correct" checked={questionForm.correct_index === idx} onChange={() => setQuestionForm({...questionForm, correct_index: idx})} className="w-5 h-5" />
                    <span className={`w-6 text-center font-bold ${questionForm.correct_index === idx ? 'text-green-400' : 'text-slate-400'}`}>{String.fromCharCode(65 + idx)}</span>
                    <input type="text" placeholder={`Variant ${String.fromCharCode(65 + idx)}`} value={opt} onChange={e => { const newOpts = [...questionForm.options]; newOpts[idx] = e.target.value; setQuestionForm({...questionForm, options: newOpts}) }} className="flex-1 bg-slate-700 rounded-lg p-2 text-white" />
                  </div>
                ))}
                <p className="text-green-400 text-xs mt-1">✓ To'g'ri javob: {String.fromCharCode(65 + questionForm.correct_index)}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowQuestionModal(false); setSelectedQuiz(null); loadData() }} className="flex-1 py-3 bg-slate-700 rounded-xl text-white">Tugatish</button>
              <button onClick={addQuestion} className="flex-1 py-3 bg-green-500 rounded-xl text-white font-bold">Qo'shish +</button>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  )
}