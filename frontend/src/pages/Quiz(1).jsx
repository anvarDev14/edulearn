import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Trophy, XCircle } from 'lucide-react'
import { quizAPI } from '../api'
import Loader from '../components/common/Loader'

export default function Quiz() {
  const { quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadQuiz()
  }, [quizId])

  useEffect(() => {
    if (!quiz || submitted || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [quiz, submitted, timeLeft])

  const loadQuiz = async () => {
    try {
      const res = await quizAPI.getQuiz(quizId)
      setQuiz(res.data)
      setTimeLeft(res.data.time_limit || 120)
    } catch (error) {
      console.error(error)
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  const selectAnswer = (questionId, optionIndex) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await quizAPI.submitQuiz(quizId, answers)
      setResult(res.data)
      setSubmitted(true)
    } catch (error) {
      alert('Xatolik')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) return <Loader />
  if (!quiz) return <div className="p-4 text-center text-red-500">Quiz topilmadi</div>

  const questions = quiz.questions || []
  const currentQ = questions[currentQuestion]

  if (submitted && result) {
    const passed = result.score >= quiz.passing_score
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-md w-full">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-green-500' : 'bg-red-500'}`}>
            {passed ? <Trophy size={48} className="text-white" /> : <XCircle size={48} className="text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{passed ? 'Tabriklaymiz! 🎉' : 'Urinib ko\'ring 😔'}</h1>
          <div className="bg-slate-700 rounded-xl p-4 mb-6">
            <div className="text-4xl font-bold text-white mb-2">{result.score}%</div>
            <p className="text-slate-400 text-sm">{result.correct_count}/{result.total_questions} to'g'ri</p>
            {result.xp_earned > 0 && <p className="text-yellow-400 mt-2">+{result.xp_earned} XP</p>}
          </div>
          <button onClick={() => navigate(-1)} className="w-full py-3 bg-blue-500 rounded-xl text-white font-bold">Davom etish</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-slate-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 text-white"><ArrowLeft size={24} /></button>
          <h1 className="font-bold text-white">{quiz.title}</h1>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${timeLeft < 30 ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}>
            <Clock size={16} className="text-white" />
            <span className="text-white font-mono">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
        </div>
        <p className="text-slate-400 text-sm mt-2 text-center">Savol {currentQuestion + 1}/{questions.length}</p>
      </div>

      {currentQ && (
        <div className="p-4">
          <div className="bg-slate-800 rounded-xl p-6 mb-6">
            <p className="text-white text-lg font-medium">{currentQ.question}</p>
          </div>
          <div className="space-y-3">
            {currentQ.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => selectAnswer(currentQ.id, idx)}
                className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition ${answers[currentQ.id] === idx ? 'bg-blue-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${answers[currentQ.id] === idx ? 'bg-white text-blue-500' : 'bg-slate-700'}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))} disabled={currentQuestion === 0} className="flex-1 py-3 bg-slate-700 rounded-xl text-white disabled:opacity-50">Oldingi</button>
          {currentQuestion < questions.length - 1 ? (
            <button onClick={() => setCurrentQuestion(prev => prev + 1)} className="flex-1 py-3 bg-blue-500 rounded-xl text-white font-bold">Keyingi</button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 bg-green-500 rounded-xl text-white font-bold disabled:opacity-50">{submitting ? 'Yuklanmoqda...' : 'Tugatish'}</button>
          )}
        </div>
      </div>
    </div>
  )
}