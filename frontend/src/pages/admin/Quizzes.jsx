import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, HelpCircle, ChevronDown, ChevronUp, Sparkles, FileText, ChevronLeft } from 'lucide-react'
import { adminAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'

export default function AdminQuizzes() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedQuiz, setExpandedQuiz] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const res = await adminAPI.getQuizzes()
      setQuizzes(res.data || [])
    } catch {
      setQuizzes([])
    } finally {
      setLoading(false)
    }
  }

  const deleteQuiz = async (id) => {
    if (!confirm("Quizni o'chirishni xohlaysizmi?")) return
    try {
      await adminAPI.deleteQuiz(id)
      loadData()
    } catch { alert('Xatolik') }
  }

  if (!user?.is_admin) return (
    <div className="page" style={{ textAlign: 'center' }}>
      <p style={{ color: 'var(--red)', fontSize: 18 }}>Ruxsat yo'q</p>
    </div>
  )

  if (loading) return <Loader />

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ChevronLeft size={18} style={{ color: 'var(--text)' }} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Quizlar</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>{quizzes.length} ta quiz</p>
        </div>
      </div>

      {/* Create buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
        <button
          onClick={() => navigate('/admin/quizzes/create')}
          className="card"
          style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--primary-dim)', borderColor: 'rgba(123,79,58,0.2)' }}
        >
          <FileText size={24} style={{ color: 'var(--primary)', marginBottom: 8 }} />
          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>Qo'lda yaratish</p>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>Savollarni o'zingiz kiriting</p>
        </button>
        <button
          onClick={() => navigate('/admin/quizzes/ai-create')}
          className="card"
          style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--accent-dim)', borderColor: 'rgba(196,149,106,0.2)' }}
        >
          <Sparkles size={24} style={{ color: 'var(--accent)', marginBottom: 8 }} />
          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>AI bilan yaratish</p>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>Video yuklang, AI quiz yaratadi</p>
        </button>
      </div>

      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
        Mavjud quizlar
      </p>

      {quizzes.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {quizzes.map(quiz => (
            <div key={quiz.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{ padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}
              >
                <div style={{ width: 36, height: 36, background: 'var(--primary-dim)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HelpCircle size={17} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{quiz.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {quiz.questions?.length || 0} ta savol · {quiz.time_limit}s
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/admin/quizzes/${quiz.id}/add-question`) }}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '5px 8px' }}
                >
                  <Plus size={13} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); deleteQuiz(quiz.id) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 6px', color: 'var(--red)' }}
                >
                  <Trash2 size={14} />
                </button>
                {expandedQuiz === quiz.id
                  ? <ChevronUp size={15} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                  : <ChevronDown size={15} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                }
              </div>

              {expandedQuiz === quiz.id && quiz.questions?.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)', padding: '10px 12px' }}>
                  {quiz.questions.map((q, idx) => (
                    <div key={q.id} style={{ background: 'var(--surface)', borderRadius: 8, padding: '10px 12px', marginBottom: 6, border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700, marginRight: 6 }}>{idx + 1}.</span>
                        {q.question}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        {q.options?.map((opt, optIdx) => (
                          <p key={optIdx} style={{
                            fontSize: 11, padding: '4px 8px', borderRadius: 6,
                            background: q.correct_index === optIdx ? 'var(--green-dim)' : 'var(--bg2)',
                            color: q.correct_index === optIdx ? 'var(--green)' : 'var(--text3)',
                          }}>
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
        <div className="empty">
          <span className="empty-icon">❓</span>
          <p className="empty-title">Quizlar yo'q</p>
          <p className="empty-desc">Yuqoridagi tugmalardan foydalaning</p>
        </div>
      )}
    </div>
  )
}
