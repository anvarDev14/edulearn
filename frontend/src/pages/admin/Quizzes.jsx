import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, HelpCircle, ChevronDown, ChevronUp, Sparkles, Video, FileText, Loader2 } from 'lucide-react'
import { adminAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'

export default function AdminQuizzes() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [modules, setModules] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedQuiz, setExpandedQuiz] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await adminAPI.getModules()
      setModules(res.data)
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

  const deleteQuiz = async (id) => {
    if (!confirm("Quizni o'chirishni xohlaysizmi?")) return
    try {
      await adminAPI.deleteQuiz(id)
      loadData()
    } catch (error) {
      alert('Xatolik')
    }
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Quizlar</h1>
      </div>

      {/* Quiz yaratish usullari */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/quizzes/create')}
          className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 text-left hover:from-blue-500 hover:to-blue-600 transition-all"
        >
          <FileText size={28} className="text-blue-200 mb-2" />
          <p className="font-bold text-white">Qo'lda yaratish</p>
          <p className="text-blue-200 text-xs mt-1">Savollarni o'zingiz kiriting</p>
        </button>

        <button
          onClick={() => navigate('/admin/quizzes/ai-create')}
          className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-4 text-left hover:from-purple-500 hover:to-indigo-600 transition-all"
        >
          <Sparkles size={28} className="text-purple-200 mb-2" />
          <p className="font-bold text-white">AI bilan yaratish</p>
          <p className="text-purple-200 text-xs mt-1">Video yuklang, AI quiz yaratadi</p>
        </button>
      </div>

      {/* Mavjud quizlar */}
      <h2 className="text-lg font-bold text-white mb-4">Mavjud quizlar</h2>

      {quizzes.length > 0 ? (
        <div className="space-y-3">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="bg-slate-800 rounded-xl overflow-hidden">
              <div
                className="p-4 flex items-center gap-3 cursor-pointer"
                onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}
              >
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <HelpCircle className="text-purple-400" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{quiz.title}</p>
                  <p className="text-slate-400 text-sm">
                    {quiz.questions?.length || 0} ta savol • {quiz.time_limit} soniya
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/admin/quizzes/${quiz.id}/add-question`); }}
                  className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition"
                >
                  <Plus size={16} className="text-green-400" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteQuiz(quiz.id); }}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
                {expandedQuiz === quiz.id ?
                  <ChevronUp size={18} className="text-slate-400" /> :
                  <ChevronDown size={18} className="text-slate-400" />
                }
              </div>

              {expandedQuiz === quiz.id && quiz.questions?.length > 0 && (
                <div className="border-t border-slate-700 p-4 space-y-2">
                  {quiz.questions.map((q, idx) => (
                    <div key={q.id} className="bg-slate-700/50 rounded-lg p-3">
                      <p className="text-white text-sm">
                        <span className="text-purple-400 font-bold mr-2">{idx + 1}.</span>
                        {q.question}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        {q.options?.map((opt, optIdx) => (
                          <p key={optIdx} className={`text-xs px-2 py-1 rounded ${
                            q.correct_index === optIdx
                              ? 'bg-green-500/20 text-green-400'
                              : 'text-slate-400'
                          }`}>
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
        <div className="text-center py-12 bg-slate-800/50 rounded-2xl">
          <HelpCircle size={48} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400">Quizlar yo'q</p>
          <p className="text-slate-500 text-sm mt-1">Yuqoridagi tugmalardan foydalaning</p>
        </div>
      )}
    </div>
  )
}
