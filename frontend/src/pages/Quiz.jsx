import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, CheckCircle, XCircle, Zap } from 'lucide-react'
import { quizAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import LevelUpModal from '../components/gamification/LevelUpModal'
import Loader from '../components/common/Loader'

export default function Quiz() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [levelUp, setLevelUp] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  
  useEffect(() => {
    loadQuiz()
  }, [quizId])
  
  useEffect(() => {
    if (quiz && timeLeft > 0 && !result) {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            submitQuiz()
            return 0
          }
          return t - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [quiz, timeLeft, result])
  
  const loadQuiz = async () => {
    try {
      const res = await quizAPI.getQuiz(quizId)
      setQuiz(res.data)
      setTimeLeft(res.data.time_limit_sec)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const selectAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }
  
  const submitQuiz = async () => {
    if (submitting) return
    setSubmitting(true)
    
    try {
      const answersArray = Object.entries(answers).map(([qId, ans]) => ({
        question_id: parseInt(qId),
        answer: ans
      }))
      
      const res = await quizAPI.submitQuiz(quizId, answersArray)
      setResult(res.data)
      
      if (res.data.level_up) {
        setLevelUp({
          level: res.data.new_level,
          badge: res.data.level_info.badge
        })
      }
      
      updateUser({
        total_xp: res.data.level_info.total_xp,
        level: res.data.new_level
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }
  
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }
  
  if (loading) return <Loader />
  if (!quiz) return null
  
  const question = quiz.questions[currentQ]
  
  // Result screen
  if (result) {
    return (
      <div className="min-h-screen p-4">
        <motion.div 
          className="bg-slate-800 rounded-2xl p-6 text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-6xl mb-4">
            {result.passed ? '🎉' : '😔'}
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {result.passed ? 'Tabriklaymiz!' : "Qayta urinib ko'ring"}
          </h2>
          
          <p className="text-slate-400 mb-6">
            {result.correct_answers}/{result.total_questions} to'g'ri ({result.score}%)
          </p>
          
          {result.passed && (
            <div className="bg-green-500/20 rounded-xl p-4 mb-6">
              <p className="text-green-400 font-bold flex items-center justify-center gap-2">
                <Zap size={20} /> +{result.xp_gained} XP
              </p>
            </div>
          )}
          
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-500 py-3 rounded-xl font-bold"
          >
            Davom etish
          </button>
        </motion.div>
        
        <LevelUpModal 
          isOpen={!!levelUp}
          onClose={() => setLevelUp(null)}
          newLevel={levelUp?.level}
          badge={levelUp?.badge}
        />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 p-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold">{quiz.title}</h1>
        <div className={`flex items-center gap-1 ${timeLeft < 60 ? 'text-red-500' : 'text-slate-400'}`}>
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>
      </div>
      
      {/* Progress */}
      <div className="p-4">
        <div className="flex gap-1 mb-4">
          {quiz.questions.map((_, i) => (
            <div 
              key={i}
              className={`flex-1 h-1 rounded-full ${
                i < currentQ ? 'bg-green-500' :
                i === currentQ ? 'bg-blue-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
        
        <p className="text-slate-400 text-sm">
          Savol {currentQ + 1}/{quiz.questions.length}
        </p>
      </div>
      
      {/* Question */}
      <div className="flex-1 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-bold mb-6">{question.question_text}</h2>
            
            <div className="space-y-3">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => selectAnswer(question.id, option)}
                  className={`w-full p-4 rounded-xl text-left transition ${
                    answers[question.id] === option
                      ? 'bg-blue-500 border-2 border-blue-400'
                      : 'bg-slate-800 border-2 border-transparent hover:border-slate-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation */}
      <div className="p-4 flex gap-3">
        {currentQ > 0 && (
          <button
            onClick={() => setCurrentQ(c => c - 1)}
            className="flex-1 py-3 bg-slate-700 rounded-xl font-bold"
          >
            Orqaga
          </button>
        )}
        
        {currentQ < quiz.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(c => c + 1)}
            disabled={!answers[question.id]}
            className="flex-1 py-3 bg-blue-500 rounded-xl font-bold disabled:opacity-50"
          >
            Keyingi
          </button>
        ) : (
          <button
            onClick={submitQuiz}
            disabled={submitting || Object.keys(answers).length < quiz.questions.length}
            className="flex-1 py-3 bg-green-500 rounded-xl font-bold disabled:opacity-50"
          >
            {submitting ? 'Yuklanmoqda...' : 'Tugatish'}
          </button>
        )}
      </div>
    </div>
  )
}
