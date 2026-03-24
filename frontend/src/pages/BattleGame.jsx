import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { battleAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { Trophy, Clock, Swords } from 'lucide-react'

const POLL_MS = 2500
const TIME_PER_QUESTION = 20  // seconds

export default function BattleGame() {
  const { battleId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [battle, setBattle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [myAnswers, setMyAnswers] = useState({})   // { questionId: answer }
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)
  const [lastResult, setLastResult] = useState(null)  // true/false/null
  const timerRef = useRef(null)
  const pollRef = useRef(null)

  const loadStatus = useCallback(async () => {
    try {
      const res = await battleAPI.getStatus(battleId)
      const b = res.data
      setBattle(b)
      if (b.my_answers) setMyAnswers(b.my_answers)
      return b
    } catch {
      return null
    }
  }, [battleId])

  useEffect(() => {
    loadStatus().finally(() => setLoading(false))
  }, [loadStatus])

  // Poll every 2.5s to sync opponent answers / finished state
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      const b = await loadStatus()
      if (b?.status === 'finished') clearInterval(pollRef.current)
    }, POLL_MS)
    return () => clearInterval(pollRef.current)
  }, [loadStatus])

  // Timer per question
  useEffect(() => {
    if (!battle || battle.status !== 'active') return
    const questions = battle.questions || []
    const current = questions[currentIdx]
    if (!current || myAnswers[current.id]) return   // already answered

    setTimeLeft(TIME_PER_QUESTION)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          // Auto-skip (submit empty)
          handleAnswer(current.id, '__timeout__')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [currentIdx, battle?.status])

  const handleAnswer = async (questionId, answer) => {
    if (submitting || myAnswers[questionId]) return
    clearInterval(timerRef.current)
    setSubmitting(true)

    try {
      const res = await battleAPI.submitAnswer(+battleId, questionId, answer)
      const correct = res.data.is_correct
      setLastResult(correct)
      setMyAnswers(prev => ({ ...prev, [questionId]: answer }))

      // Show result briefly, then next question
      setTimeout(() => {
        setLastResult(null)
        const questions = battle?.questions || []
        if (currentIdx < questions.length - 1) {
          setCurrentIdx(i => i + 1)
        }
      }, 900)
    } catch (e) {
      alert(e.response?.data?.detail || "Xatolik")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loader-full"><div className="spinner" /></div>
  if (!battle) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
      <p style={{ fontSize: 36, marginBottom: 12 }}>😕</p>
      <p style={{ color: 'var(--text3)' }}>Battle topilmadi</p>
      <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/battle')}>Orqaga</button>
    </div>
  )

  // Waiting for opponent
  if (battle.status === 'waiting') {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse 1.5s infinite' }}>⏳</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Raqib kutilmoqda...</h2>
        <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 4 }}>{battle.module_emoji} {battle.module_title}</p>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 28 }}>Boshqa user lobbyingizga qo'shilishini kuting</p>
        <div style={{ display: 'flex', gap: 5, marginBottom: 28 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', opacity: 0.4, animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
          ))}
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/battle')}>Bekor qilish</button>
      </div>
    )
  }

  const questions = battle.questions || []
  const current = questions[currentIdx]

  // Finished
  if (battle.status === 'finished') {
    const myScore = battle.is_creator ? battle.creator_score : battle.opponent_score
    const oppScore = battle.is_creator ? battle.opponent_score : battle.creator_score
    const won = battle.winner_id === user?.id
    const draw = !battle.winner_id
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>
          {won ? '🏆' : draw ? '🤝' : '💔'}
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6, color: won ? 'var(--green)' : draw ? 'var(--gold)' : 'var(--red)' }}>
          {won ? "G'alaba!" : draw ? 'Durrang' : "Mag'lubiyat"}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text3)', marginBottom: 24 }}>
          {battle.module_emoji} {battle.module_title}
        </p>

        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>SEN</p>
            <p style={{ fontSize: 40, fontWeight: 900, color: 'var(--primary)' }}>{myScore}</p>
          </div>
          <div style={{ fontSize: 22, color: 'var(--text3)', fontWeight: 700 }}>–</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>RAQIB</p>
            <p style={{ fontSize: 40, fontWeight: 900, color: 'var(--text3)' }}>{oppScore}</p>
          </div>
        </div>

        {won && (
          <div className="card" style={{ background: 'var(--gold-dim)', borderColor: 'rgba(184,115,51,0.2)', marginBottom: 20 }}>
            <p style={{ fontWeight: 700, color: 'var(--gold)' }}>+{battle.xp_reward} XP olindi! 🎉</p>
          </div>
        )}

        {/* Question breakdown */}
        <div style={{ textAlign: 'left', marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
            Savol natijalari
          </p>
          {questions.map((q, i) => {
            const myAns = myAnswers[q.id]
            const correct = myAns === q.correct_answer
            return (
              <div key={q.id} className="card card-sm" style={{ marginBottom: 6, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{correct ? '✅' : '❌'}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{q.question_text}</p>
                  {!correct && myAns && myAns !== '__timeout__' && (
                    <p style={{ fontSize: 11, color: 'var(--red)' }}>Sizning: {myAns}</p>
                  )}
                  {myAns === '__timeout__' && (
                    <p style={{ fontSize: 11, color: 'var(--text3)' }}>Vaqt tugadi</p>
                  )}
                  {q.correct_answer && !correct && (
                    <p style={{ fontSize: 11, color: 'var(--green)' }}>To'g'ri: {q.correct_answer}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <button className="btn btn-primary btn-full" onClick={() => navigate('/battle')}>
          Yana jang qilish
        </button>
      </div>
    )
  }

  // Active game
  if (!current) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>✅</p>
        <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Barcha savollarga javob berdingiz!</p>
        <p style={{ color: 'var(--text3)', fontSize: 14 }}>Raqib javobi kutilmoqda...</p>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 20 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', opacity: 0.4, animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    )
  }

  const answered = !!myAnswers[current.id]
  const progress = (currentIdx / questions.length) * 100
  const myScore = battle.is_creator ? battle.creator_score : battle.opponent_score
  const oppScore = battle.is_creator ? battle.opponent_score : battle.creator_score

  return (
    <div className="page" style={{ paddingBottom: 20 }}>
      {/* Score bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>SEN</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)' }}>{myScore}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Swords size={20} style={{ color: 'var(--text3)' }} />
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700 }}>
            {currentIdx + 1}/{questions.length}
          </span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>RAQIB</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text3)' }}>{oppScore}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar" style={{ marginBottom: 14 }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Timer */}
      {!answered && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
          <Clock size={14} style={{ color: timeLeft <= 5 ? 'var(--red)' : 'var(--text3)' }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: timeLeft <= 5 ? 'var(--red)' : 'var(--text)' }}>
            {timeLeft}s
          </span>
        </div>
      )}

      {/* Question */}
      <div className="card" style={{ marginBottom: 16, padding: '18px 16px' }}>
        <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
          Savol {currentIdx + 1}
        </p>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.5 }}>
          {current.question_text}
        </p>
      </div>

      {/* Result flash */}
      {lastResult !== null && (
        <div style={{
          textAlign: 'center', fontSize: 40, marginBottom: 12,
          animation: 'fadeIn 0.2s ease'
        }}>
          {lastResult ? '✅' : '❌'}
        </div>
      )}

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(current.options || []).map((opt, i) => {
          const isSelected = myAnswers[current.id] === opt
          const isCorrect = answered && current.correct_answer === opt
          const isWrong = answered && isSelected && !isCorrect

          let bg = 'var(--surface)'
          let border = 'var(--border)'
          let textColor = 'var(--text)'
          if (isCorrect) { bg = 'var(--green-dim)'; border = 'var(--green)'; textColor = 'var(--green)' }
          if (isWrong) { bg = 'var(--red-dim)'; border = 'var(--red)'; textColor = 'var(--red)' }

          return (
            <button
              key={i}
              onClick={() => !answered && handleAnswer(current.id, opt)}
              disabled={answered || submitting}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12,
                border: `2px solid ${border}`, background: bg, cursor: answered ? 'default' : 'pointer',
                textAlign: 'left', fontSize: 14, fontWeight: 600, color: textColor,
                transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, color: 'var(--text3)'
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Next question button (if answered) */}
      {answered && currentIdx < questions.length - 1 && (
        <button
          className="btn btn-primary btn-full"
          style={{ marginTop: 16 }}
          onClick={() => setCurrentIdx(i => i + 1)}
        >
          Keyingi savol →
        </button>
      )}
    </div>
  )
}
