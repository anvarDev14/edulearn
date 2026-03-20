import { useState, useEffect } from 'react'
import { Plus, Trash2, Crown, ChevronDown, ChevronUp, ChevronLeft, X, Upload, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { adminAPI, getMediaUrl } from '../../api'

const emptyCategory = { title: '', description: '', emoji: '📖', order_index: 0 }
const emptyBook = {
  title: '', description: '', file_url: '', cover_url: '',
  author: '', language: '', pages: '', is_premium: false, order_index: 0
}

const inp = {
  width: '100%', padding: '10px 12px',
  background: 'var(--bg2)', border: '1.5px solid var(--border)',
  borderRadius: 10, color: 'var(--text)', fontSize: 14, outline: 'none',
  fontFamily: 'var(--font)', boxSizing: 'border-box',
}

export default function AdminBooks() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [books, setBooks] = useState({})     // { catId: [...] }
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const [showCatModal, setShowCatModal] = useState(false)
  const [catForm, setCatForm] = useState(emptyCategory)

  const [showBookModal, setShowBookModal] = useState(false)
  const [selectedCat, setSelectedCat] = useState(null)
  const [bookForm, setBookForm] = useState(emptyBook)

  const [bookFile, setBookFile] = useState(null)
  const [bookUploading, setBookUploading] = useState(false)
  const [bookProgress, setBookProgress] = useState(0)

  const loadCategories = async () => {
    try {
      const res = await adminAPI.getBookCategories()
      setCategories(res.data)
    } finally {
      setLoading(false)
    }
  }

  const loadBooks = async (catId) => {
    const res = await adminAPI.getCategoryBooks(catId)
    setBooks(prev => ({ ...prev, [catId]: res.data }))
  }

  useEffect(() => { loadCategories() }, [])

  const toggleExpand = async (catId) => {
    if (expanded === catId) { setExpanded(null); return }
    setExpanded(catId)
    if (!books[catId]) await loadBooks(catId)
  }

  // Category CRUD
  const createCategory = async () => {
    if (!catForm.title.trim()) return alert('Kategoriya nomini kiriting')
    await adminAPI.createBookCategory(catForm)
    setShowCatModal(false)
    setCatForm(emptyCategory)
    loadCategories()
  }

  const deleteCategory = async (id) => {
    if (!confirm("Kategoriyani va barcha kitoblarni o'chirishni tasdiqlaysizmi?")) return
    await adminAPI.deleteBookCategory(id)
    loadCategories()
  }

  // Book CRUD
  const openBookModal = (cat) => {
    setSelectedCat(cat)
    setBookForm(emptyBook)
    setBookFile(null)
    setBookProgress(0)
    setShowBookModal(true)
  }

  const handleBookFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setBookFile(file)
    setBookUploading(true)
    setBookProgress(0)
    try {
      const res = await adminAPI.uploadBook(file, (evt) => {
        if (evt.total) setBookProgress(Math.round((evt.loaded / evt.total) * 100))
      })
      setBookForm(f => ({ ...f, file_url: res.data.url }))
    } catch {
      alert("Fayl yuklab bo'lmadi")
      setBookFile(null)
    } finally {
      setBookUploading(false)
    }
  }

  const createBook = async () => {
    if (!bookForm.title.trim()) return alert('Kitob nomini kiriting')
    await adminAPI.createBook({
      ...bookForm,
      category_id: selectedCat.id,
      pages: bookForm.pages ? parseInt(bookForm.pages) : null,
      file_url: bookForm.file_url || null,
      cover_url: bookForm.cover_url || null,
    })
    setShowBookModal(false)
    loadBooks(selectedCat.id)
  }

  const deleteBook = async (catId, bookId) => {
    if (!confirm("Kitobni o'chirishni tasdiqlaysizmi?")) return
    await adminAPI.deleteBook(bookId)
    loadBooks(catId)
  }

  if (loading) return <div className="loader-full"><div className="spinner" /></div>

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('/admin')}
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={18} style={{ color: 'var(--text)' }} />
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>📚 Elektron Kitoblar</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>{categories.length} ta kategoriya</p>
          </div>
        </div>
        <button onClick={() => setShowCatModal(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Plus size={15} /> Kategoriya
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {categories.map(cat => (
          <div key={cat.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{ padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onClick={() => toggleExpand(cat.id)}
            >
              <span style={{ fontSize: 24 }}>{cat.emoji}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{cat.title}</span>
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {books[cat.id] ? `${books[cat.id].length} ta kitob` : "Ko'rish uchun bosing"}
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); openBookModal(cat) }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '5px 8px' }}
                title="Kitob qo'shish"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); deleteCategory(cat.id) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 6px', color: 'var(--red)' }}
                title="Kategoriyani o'chirish"
              >
                <Trash2 size={15} />
              </button>
              {expanded === cat.id
                ? <ChevronUp size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                : <ChevronDown size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />
              }
            </div>

            {expanded === cat.id && (
              <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)', padding: '10px 12px' }}>
                {(books[cat.id] || []).length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '12px 0' }}>
                    Hozircha kitob yo'q. + tugmasini bosib qo'shing
                  </p>
                ) : (
                  (books[cat.id] || []).map((b, idx) => (
                    <div key={b.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                      background: 'var(--surface)', borderRadius: 8, marginBottom: 6,
                      border: '1px solid var(--border)',
                    }}>
                      <span style={{ color: 'var(--text3)', fontSize: 12, width: 20, flexShrink: 0 }}>{idx + 1}.</span>
                      {/* mini cover */}
                      <div style={{
                        width: 32, height: 44, borderRadius: 5, flexShrink: 0,
                        background: 'var(--accent-dim)', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                      }}>
                        📖
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{b.title}</p>
                          {b.is_premium && <Crown size={11} style={{ color: 'var(--gold)' }} />}
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                          {b.author && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{b.author}</span>}
                          {b.pages && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{b.pages} bet</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteBook(cat.id, b.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--red)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 32, marginBottom: 10 }}>📚</p>
            <p style={{ color: 'var(--text3)', fontSize: 14 }}>Hali kategoriya yo'q. "Kategoriya" tugmasini bosing</p>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <p className="modal-title" style={{ margin: 0 }}>📖 Yangi kategoriya</p>
              <button onClick={() => setShowCatModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: 'var(--text3)' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="input-label">Nomi *</label>
                <input style={inp} placeholder="Masalan: O'zbek adabiyoti" value={catForm.title} onChange={e => setCatForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Tavsif</label>
                <textarea style={{ ...inp, minHeight: 64, resize: 'vertical' }} placeholder="Kategoriya haqida..." value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="input-label">Emoji</label>
                  <input style={inp} placeholder="📖" value={catForm.emoji} onChange={e => setCatForm(f => ({ ...f, emoji: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Tartib raqami</label>
                  <input style={inp} type="number" value={catForm.order_index} onChange={e => setCatForm(f => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowCatModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Bekor</button>
              <button onClick={createCategory} className="btn btn-primary" style={{ flex: 1 }}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Book Modal */}
      {showBookModal && (
        <div className="modal-overlay" onClick={() => setShowBookModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <p className="modal-title" style={{ margin: 0 }}>📕 Yangi kitob</p>
              <button onClick={() => setShowBookModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: 'var(--text3)' }} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>{selectedCat?.emoji} {selectedCat?.title}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="input-label">Kitob nomi *</label>
                <input style={inp} placeholder="Masalan: English Grammar in Use" value={bookForm.title} onChange={e => setBookForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              <div>
                <label className="input-label">Tavsif</label>
                <textarea style={{ ...inp, minHeight: 64, resize: 'vertical' }} placeholder="Kitob haqida..." value={bookForm.description} onChange={e => setBookForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* File upload */}
              <div>
                <label className="input-label">Kitob faylini yuklash (PDF va boshqalar)</label>
                <label style={{ display: 'block', cursor: 'pointer' }}>
                  <div style={{
                    border: `2px dashed ${bookForm.file_url ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: 10, padding: '14px', textAlign: 'center',
                    background: bookForm.file_url ? 'var(--green-dim)' : 'var(--bg2)',
                  }}>
                    {bookUploading ? (
                      <div>
                        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>Yuklanmoqda... {bookProgress}%</p>
                        <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${bookProgress}%`, background: 'var(--primary)', transition: 'width 0.2s' }} />
                        </div>
                      </div>
                    ) : bookForm.file_url ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <CheckCircle size={16} style={{ color: 'var(--green)' }} />
                        <p style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>{bookFile?.name || 'Fayl yuklandi'}</p>
                      </div>
                    ) : (
                      <div>
                        <Upload size={22} style={{ color: 'var(--text3)', margin: '0 auto 6px' }} />
                        <p style={{ fontSize: 13, color: 'var(--text3)' }}>Kitob faylini tanlang</p>
                        <p style={{ fontSize: 11, color: 'var(--text3)', opacity: 0.7, marginTop: 3 }}>PDF, EPUB, FB2, DJVU</p>
                      </div>
                    )}
                  </div>
                  <input type="file" accept=".pdf,.epub,.fb2,.djvu,.doc,.docx" onChange={handleBookFileSelect} style={{ display: 'none' }} disabled={bookUploading} />
                </label>
                {bookForm.file_url && (
                  <button
                    onClick={() => { setBookFile(null); setBookForm(f => ({ ...f, file_url: '' })) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--red)', marginTop: 4 }}
                  >
                    × Faylni o'chirish
                  </button>
                )}
              </div>

              <div>
                <label className="input-label">Yoki fayl URL (ixtiyoriy)</label>
                <input style={inp} placeholder="https://..." value={bookForm.file_url} onChange={e => setBookForm(f => ({ ...f, file_url: e.target.value }))} />
              </div>

              <div>
                <label className="input-label">Muqova rasmi URL (ixtiyoriy)</label>
                <input style={inp} placeholder="https://..." value={bookForm.cover_url} onChange={e => setBookForm(f => ({ ...f, cover_url: e.target.value }))} />
                {bookForm.cover_url && (
                  <img
                    src={getMediaUrl(bookForm.cover_url)} alt="cover"
                    style={{ width: 80, height: 110, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
                    onError={e => e.target.style.display = 'none'}
                  />
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="input-label">Muallif</label>
                  <input style={inp} placeholder="Ism Familiya" value={bookForm.author} onChange={e => setBookForm(f => ({ ...f, author: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Til</label>
                  <input style={inp} placeholder="O'zbek" value={bookForm.language} onChange={e => setBookForm(f => ({ ...f, language: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="input-label">Betlar soni</label>
                  <input style={inp} type="number" placeholder="256" value={bookForm.pages} onChange={e => setBookForm(f => ({ ...f, pages: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Tartib raqami</label>
                  <input style={inp} type="number" value={bookForm.order_index} onChange={e => setBookForm(f => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>
                <input type="checkbox" checked={bookForm.is_premium} onChange={e => setBookForm(f => ({ ...f, is_premium: e.target.checked }))} />
                <Crown size={14} style={{ color: 'var(--gold)' }} /> Premium kitob
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowBookModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Bekor</button>
              <button onClick={createBook} className="btn btn-primary" style={{ flex: 1 }}>Qo'shish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
