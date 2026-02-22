import { useState, useEffect } from 'react'
import { Plus, Trash2, Crown } from 'lucide-react'
import { adminAPI } from '../../api'
import Loader from '../../components/common/Loader'

export default function AdminModules() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', emoji: '📚', is_premium: false })
  
  useEffect(() => {
    loadModules()
  }, [])
  
  const loadModules = async () => {
    try {
      const res = await adminAPI.getModules()
      setModules(res.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const createModule = async () => {
    try {
      await adminAPI.createModule(form)
      setShowModal(false)
      setForm({ title: '', description: '', emoji: '📚', is_premium: false })
      loadModules()
    } catch (error) {
      alert('Xatolik')
    }
  }
  
  const deleteModule = async (id) => {
    if (!confirm("O'chirishni xohlaysizmi?")) return
    
    try {
      await adminAPI.deleteModule(id)
      loadModules()
    } catch (error) {
      alert('Xatolik')
    }
  }
  
  if (loading) return <Loader />
  
  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📚 Modullar</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-500 p-2 rounded-xl"
        >
          <Plus size={24} />
        </button>
      </div>
      
      <div className="space-y-3">
        {modules.map(module => (
          <div key={module.id} className="bg-slate-800 rounded-xl p-4 flex items-center gap-4">
            <span className="text-3xl">{module.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{module.title}</span>
                {module.is_premium && <Crown size={14} className="text-amber-500" />}
              </div>
            </div>
            <button 
              onClick={() => deleteModule(module.id)}
              className="p-2 text-red-500"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        
        {modules.length === 0 && (
          <p className="text-center text-slate-400 py-8">Modullar yo'q</p>
        )}
      </div>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Yangi modul</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nomi"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                className="w-full bg-slate-700 rounded-xl p-3"
              />
              
              <textarea
                placeholder="Tavsif"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full bg-slate-700 rounded-xl p-3"
                rows={3}
              />
              
              <input
                type="text"
                placeholder="Emoji"
                value={form.emoji}
                onChange={e => setForm({...form, emoji: e.target.value})}
                className="w-full bg-slate-700 rounded-xl p-3"
              />
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_premium}
                  onChange={e => setForm({...form, is_premium: e.target.checked})}
                />
                Premium
              </label>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-slate-700 rounded-xl"
              >
                Bekor
              </button>
              <button 
                onClick={createModule}
                className="flex-1 py-3 bg-blue-500 rounded-xl font-bold"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
