import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Sparkles, Video, Check, Edit3, Trash2, Loader2, AlertCircle, Play, FileVideo } from 'lucide-react'
import { adminAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'

export default function QuizAICreate() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1) // 1: upload, 2: configure, 3: review, 4: save
  const [videoFile, setVideoFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [editingQuestion, setEditingQuestion] = useState(null)

  const [config, setConfig] = useState({
    lesson_id: '',
    title: '',
    time_limit: 180,
    passing_score: 70,
    question_count: 5,
    difficulty: 'medium' // easy, medium, hard
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

  const handleVideoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
      setVideoUrl('')
    }
  }

  const handleVideoUrl = (url) => {
    setVideoUrl(url)
    setVideoFile(null)
  }

  const generateQuiz = async () => {
    if (!videoFile && !videoUrl) {
      return alert('Video yuklang yoki URL kiriting')
    }
    if (!config.lesson_id || !config.title) {
      return alert('Dars va quiz nomini kiriting')
    }

    setGenerating(true)

    try {
      // Simulating AI generation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Mock generated questions based on config
      const mockQuestions = []
      const difficulties = {
        easy: ['oddiy', 'asosiy', 'boshlang\'ich'],
        medium: ['o\'rtacha', 'standart', 'oddiy bo\'lmagan'],
        hard: ['murakkab', 'qiyin', 'chuqur']
      }

      for (let i = 0; i < config.question_count; i++) {
        mockQuestions.push({
          id: i + 1,
          question: `${difficulties[config.difficulty][i % 3]} savol ${i + 1}: Video mazmuniga oid savol?`,
          options: [
            `To'g'ri javob varianti`,
            `Noto'g'ri variant A`,
            `Noto'g'ri variant B`,
            `Noto'g'ri variant C`
          ],
          correct_index: 0,
          explanation: 'AI tomonidan yaratilgan tushuntirish'
        })
      }

      setGeneratedQuestions(mockQuestions)
      setStep(3)
    } catch (error) {
      alert('AI bilan xatolik yuz berdi. Qaytadan urinib ko\'ring.')
    } finally {
      setGenerating(false)
    }
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...generatedQuestions]
    updated[index] = { ...updated[index], [field]: value }
    setGeneratedQuestions(updated)
  }

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...generatedQuestions]
    updated[qIndex].options[optIndex] = value
    setGeneratedQuestions(updated)
  }

  const deleteQuestion = (index) => {
    if (generatedQuestions.length <= 1) {
      return alert('Kamida bitta savol bo\'lishi kerak')
    }
    setGeneratedQuestions(generatedQuestions.filter((_, i) => i !== index))
  }

  const saveQuiz = async () => {
    setSaving(true)
    try {
      // Create quiz
      const quizRes = await adminAPI.createQuiz({
        lesson_id: config.lesson_id,
        title: config.title,
        time_limit: config.time_limit,
        passing_score: config.passing_score
      })

      // Add all questions
      for (const q of generatedQuestions) {
        await adminAPI.addQuestion(quizRes.data.id, {
          question: q.question,
          options: q.options,
          correct_index: q.correct_index
        })
      }

      alert('Quiz muvaffaqiyatli yaratildi!')
      navigate('/admin/quizzes')
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    } finally {
      setSaving(false)
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/quizzes')}
          className="p-2 bg-slate-800 rounded-xl"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-purple-400" />
            AI Quiz Yaratish
          </h1>
          <p className="text-slate-400 text-sm">
            {step === 1 && 'Video yuklang'}
            {step === 2 && 'Sozlamalar'}
            {step === 3 && 'Savollarni tekshiring'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition ${
              step >= s ? 'bg-purple-500' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        /* Step 1: Upload Video */
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FileVideo size={20} className="text-purple-400" />
              Video yuklash
            </h3>

            <label className="block">
              <div className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                videoFile ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600 hover:border-slate-500'
              }`}>
                {videoFile ? (
                  <div className="space-y-2">
                    <Video size={40} className="mx-auto text-purple-400" />
                    <p className="text-purple-400 font-medium">{videoFile.name}</p>
                    <p className="text-slate-500 text-sm">
                      {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={40} className="mx-auto text-slate-500" />
                    <p className="text-slate-400">Video faylni yuklang</p>
                    <p className="text-slate-500 text-sm">MP4, MOV, AVI (max 500MB)</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-500 text-sm">yoki</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          <div className="bg-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Play size={20} className="text-red-400" />
              YouTube URL
            </h3>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={e => handleVideoUrl(e.target.value)}
              className="w-full bg-slate-700 rounded-xl p-3 text-white"
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!videoFile && !videoUrl}
            className="w-full py-4 bg-purple-600 rounded-xl font-bold text-white disabled:opacity-50"
          >
            Davom etish
          </button>
        </div>
      )}

      {step === 2 && (
        /* Step 2: Configure */
        <div className="bg-slate-800 rounded-2xl p-5">
          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Dars tanlang *</label>
              <select
                value={config.lesson_id}
                onChange={e => setConfig({ ...config, lesson_id: e.target.value })}
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
                value={config.title}
                onChange={e => setConfig({ ...config, title: e.target.value })}
                className="w-full bg-slate-700 rounded-xl p-3 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 text-sm block mb-2">Savollar soni</label>
              <div className="flex gap-2">
                {[3, 5, 7, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setConfig({ ...config, question_count: n })}
                    className={`flex-1 py-3 rounded-xl font-medium transition ${
                      config.question_count === n
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-sm block mb-2">Qiyinlik darajasi</label>
              <div className="flex gap-2">
                {[
                  { value: 'easy', label: 'Oson', color: 'green' },
                  { value: 'medium', label: "O'rtacha", color: 'yellow' },
                  { value: 'hard', label: 'Qiyin', color: 'red' }
                ].map(d => (
                  <button
                    key={d.value}
                    onClick={() => setConfig({ ...config, difficulty: d.value })}
                    className={`flex-1 py-3 rounded-xl font-medium transition ${
                      config.difficulty === d.value
                        ? `bg-${d.color}-600 text-white`
                        : 'bg-slate-700 text-slate-400'
                    }`}
                    style={{
                      backgroundColor: config.difficulty === d.value
                        ? d.color === 'green' ? '#16a34a'
                          : d.color === 'yellow' ? '#ca8a04'
                            : '#dc2626'
                        : undefined
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-sm block mb-2">Vaqt (soniya)</label>
                <input
                  type="number"
                  value={config.time_limit}
                  onChange={e => setConfig({ ...config, time_limit: parseInt(e.target.value) || 180 })}
                  className="w-full bg-slate-700 rounded-xl p-3 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-2">O'tish bali (%)</label>
                <input
                  type="number"
                  value={config.passing_score}
                  onChange={e => setConfig({ ...config, passing_score: parseInt(e.target.value) || 70 })}
                  className="w-full bg-slate-700 rounded-xl p-3 text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-4 bg-slate-700 rounded-xl font-bold text-white"
            >
              Orqaga
            </button>
            <button
              onClick={generateQuiz}
              disabled={generating || !config.lesson_id || !config.title}
              className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Yaratilmoqda...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Yaratish
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        /* Step 3: Review & Edit */
        <div className="space-y-4">
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-purple-400 mt-0.5" />
            <div>
              <p className="text-purple-300 font-medium">AI yaratgan savollar</p>
              <p className="text-purple-400/80 text-sm">
                Savollarni tekshiring va kerak bo'lsa tahrirlang
              </p>
            </div>
          </div>

          {generatedQuestions.map((q, qIndex) => (
            <div key={q.id} className="bg-slate-800 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="bg-purple-500 text-white text-sm font-bold px-2 py-1 rounded-lg">
                  {qIndex + 1}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingQuestion(editingQuestion === qIndex ? null : qIndex)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition"
                  >
                    <Edit3 size={16} className="text-blue-400" />
                  </button>
                  <button
                    onClick={() => deleteQuestion(qIndex)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>

              {editingQuestion === qIndex ? (
                <div className="space-y-3">
                  <textarea
                    value={q.question}
                    onChange={e => updateQuestion(qIndex, 'question', e.target.value)}
                    className="w-full bg-slate-700 rounded-xl p-3 text-white"
                    rows={2}
                  />
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuestion(qIndex, 'correct_index', optIndex)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          q.correct_index === optIndex
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-600 text-slate-400'
                        }`}
                      >
                        {q.correct_index === optIndex ? <Check size={16} /> : String.fromCharCode(65 + optIndex)}
                      </button>
                      <input
                        value={opt}
                        onChange={e => updateOption(qIndex, optIndex, e.target.value)}
                        className="flex-1 bg-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-white mb-3">{q.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, optIndex) => (
                      <p
                        key={optIndex}
                        className={`text-sm px-3 py-2 rounded-lg ${
                          q.correct_index === optIndex
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}) {opt}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-4 bg-slate-700 rounded-xl font-bold text-white"
            >
              Orqaga
            </button>
            <button
              onClick={saveQuiz}
              disabled={saving}
              className="flex-1 py-4 bg-green-600 rounded-xl font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Saqlash
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
