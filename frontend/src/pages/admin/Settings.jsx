import { useState, useEffect } from 'react'
import { Plus, Trash2, Pin, Image, Video, FileText, X } from 'lucide-react'
import { adminAPI, newsAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'

export default function AdminSettings() {
  const { user } = useAuth()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewsModal, setShowNewsModal] = useState(false)

  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    media_type: 'text',
    media_url: '',
    is_pinned: false
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await newsAPI.getAll(0, 50)
      setNews(res.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNews = async () => {
    if (!newsForm.title) return alert('Sarlavhani kiriting')
    try {
      await adminAPI.createNews(newsForm)
      setShowNewsModal(false)
      setNewsForm({ title: '', content: '', media_type: 'text', media_url: '', is_pinned: false })
      loadData()
      alert('Yangilik qo\'shildi!')
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    }
  }

  const deleteNews = async (id) => {
    if (!confirm("O'chirishni xohlaysizmi?")) return
    try {
      await adminAPI.deleteNews(id)
      loadData()
    } catch (error) {
      alert('Xatolik')
    }
  }

  const togglePin = async (id) => {
    try {
      await adminAPI.toggleNewsPin(id)
      loadData()
    } catch (error) {
      alert('Xatolik')
    }
  }

  // Admin tekshiruvi
  if (!user?.is_admin) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-xl">🚫 Ruxsat yo'q</p>
        <p className="text-slate-400 mt-2">Bu sahifa faqat adminlar uchun</p>
      </div>
    )
  }

  if (loading) return <Loader />

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-white mb-6">⚙️ Sozlamalar</h1>

      {/* News */}
      <div className="bg-slate-800 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">📰 Yangiliklar</h3>
          <button onClick={() => setShowNewsModal(true)} className="bg-blue-500 p-2 rounded-lg flex items-center gap-1">
            <Plus size={18} className="text-white" />
            <span className="text-white text-sm">Qo'shish</span>
          </button>
        </div>

        <div className="space-y-2">
          {news.length > 0 ? news.map(item => (
            <div key={item.id} className="bg-slate-700 rounded-lg p-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {item.media_type === 'video' && <Video size={14} className="text-blue-400" />}
                  {item.media_type === 'image' && <Image size={14} className="text-green-400" />}
                  {item.media_type === 'text' && <FileText size={14} className="text-slate-400" />}
                  <p className="text-white text-sm font-medium">{item.title}</p>
                  {item.is_pinned && <Pin size={12} className="text-blue-400" />}
                </div>
                <p className="text-slate-400 text-xs mt-1">{item.views_count || 0} ko'rishlar</p>
              </div>
              <button onClick={() => togglePin(item.id)} className={item.is_pinned ? 'text-blue-400' : 'text-slate-500'}>
                <Pin size={16} />
              </button>
              <button onClick={() => deleteNews(item.id)} className="text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          )) : <p className="text-slate-500 text-center py-4">Yangiliklar yo'q</p>}
        </div>
      </div>

      {/* News Modal */}
      {showNewsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">📰 Yangi yangilik</h2>
              <button onClick={() => setShowNewsModal(false)} className="text-slate-400"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Sarlavha *</label>
                <input type="text" placeholder="Yangilik sarlavhasi" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" />
              </div>
              <div>
                <label className="text-slate-400 text-sm">Matn</label>
                <textarea placeholder="Yangilik matni..." value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" rows={4} />
              </div>
              <div>
                <label className="text-slate-400 text-sm">Media turi</label>
                <div className="flex gap-2 mt-1">
                  {['text', 'image', 'video'].map(type => (
                    <button key={type} onClick={() => setNewsForm({...newsForm, media_type: type})} className={`flex-1 py-2 rounded-lg ${newsForm.media_type === type ? 'bg-blue-500' : 'bg-slate-700'} text-white text-sm`}>
                      {type === 'text' && '📝 Text'}
                      {type === 'image' && '🖼️ Rasm'}
                      {type === 'video' && '🎬 Video'}
                    </button>
                  ))}
                </div>
              </div>
              {newsForm.media_type !== 'text' && (
                <div>
                  <label className="text-slate-400 text-sm">{newsForm.media_type === 'image' ? 'Rasm URL' : 'Video URL'}</label>
                  <input type="url" placeholder="https://..." value={newsForm.media_url} onChange={e => setNewsForm({...newsForm, media_url: e.target.value})} className="w-full bg-slate-700 rounded-xl p-3 text-white mt-1" />
                </div>
              )}
              <label className="flex items-center gap-2 text-white">
                <input type="checkbox" checked={newsForm.is_pinned} onChange={e => setNewsForm({...newsForm, is_pinned: e.target.checked})} className="w-5 h-5" />
                <Pin size={16} className="text-blue-400" /> Yuqoriga pin qilish
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNewsModal(false)} className="flex-1 py-3 bg-slate-700 rounded-xl text-white">Bekor</button>
              <button onClick={createNews} className="flex-1 py-3 bg-blue-500 rounded-xl text-white font-bold">Qo'shish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}