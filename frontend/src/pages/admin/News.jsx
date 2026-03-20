import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Pin, PinOff, Eye, Image, Video, FileText, X } from 'lucide-react'
import { adminAPI, getMediaUrl } from '../../api'

const MEDIA_TYPES = [
  { value: 'text', label: 'Faqat matn', icon: <FileText size={14} /> },
  { value: 'image', label: 'Rasm', icon: <Image size={14} /> },
  { value: 'video', label: 'Video', icon: <Video size={14} /> },
]

const emptyForm = {
  title: '',
  content: '',
  media_type: 'text',
  media_url: '',
  is_pinned: false,
}

export default function AdminNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    adminAPI.getNews(0, 50)
      .then(r => setNews(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError("Sarlavha kiritilishi shart")
    setSaving(true)
    setError('')
    try {
      await adminAPI.createNews({
        title: form.title.trim(),
        content: form.content.trim() || null,
        media_type: form.media_type,
        media_url: form.media_url.trim() || null,
        is_pinned: form.is_pinned,
      })
      setForm(emptyForm)
      setShowForm(false)
      load()
    } catch {
      setError("Xatolik yuz berdi")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Yangilikni o'chirishni tasdiqlaysizmi?")) return
    await adminAPI.deleteNews(id)
    load()
  }

  const handlePin = async (id) => {
    await adminAPI.toggleNewsPin(id)
    load()
  }

  if (loading) return <div className="loader-full"><div className="spinner" /></div>

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 2 }}>Admin Panel</p>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Yangiliklar</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/admin" className="btn btn-secondary btn-sm">← Orqaga</Link>
          <button
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Yopish' : "Qo'shish"}
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Yangi yangilik</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 5 }}>
                Sarlavha *
              </label>
              <input
                className="input"
                placeholder="Yangilik sarlavhasi..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 5 }}>
                Matn
              </label>
              <textarea
                className="input"
                placeholder="Yangilik matni..."
                rows={4}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                style={{ resize: 'vertical', minHeight: 90 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 8 }}>
                Media turi
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {MEDIA_TYPES.map(mt => (
                  <button
                    key={mt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, media_type: mt.value }))}
                    style={{
                      flex: 1, padding: '8px 6px', borderRadius: 10, border: '2px solid',
                      borderColor: form.media_type === mt.value ? 'var(--primary)' : 'var(--border)',
                      background: form.media_type === mt.value ? 'var(--primary-dim)' : 'var(--bg2)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 5, fontSize: 12, fontWeight: 600,
                      color: form.media_type === mt.value ? 'var(--primary)' : 'var(--text3)',
                    }}
                  >
                    {mt.icon}
                    {mt.label}
                  </button>
                ))}
              </div>
            </div>

            {(form.media_type === 'image' || form.media_type === 'video') && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: 5 }}>
                  {form.media_type === 'image' ? 'Rasm URL' : 'Video URL'}
                </label>
                <input
                  className="input"
                  placeholder={form.media_type === 'image' ? 'https://...' : 'YouTube yoki video URL...'}
                  value={form.media_url}
                  onChange={e => setForm(f => ({ ...f, media_url: e.target.value }))}
                />
                {form.media_type === 'image' && form.media_url && (
                  <img
                    src={getMediaUrl(form.media_url)}
                    alt="preview"
                    style={{ width: '100%', borderRadius: 10, marginTop: 8, maxHeight: 200, objectFit: 'cover' }}
                    onError={e => e.target.style.display = 'none'}
                  />
                )}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="pinned"
                checked={form.is_pinned}
                onChange={e => setForm(f => ({ ...f, is_pinned: e.target.checked }))}
                style={{ width: 16, height: 16 }}
              />
              <label htmlFor="pinned" style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                📌 Pin qilish (yuqorida ko'rsatish)
              </label>
            </div>

            {error && (
              <p style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setShowForm(false); setForm(emptyForm); setError('') }}
              >
                Bekor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* News list */}
      {news.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Hozircha yangilik yo'q</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {news.map(n => (
            <div key={n.id} className="card" style={{ padding: '12px 14px' }}>
              {/* Media preview */}
              {n.media_type === 'image' && n.media_url && (
                <img
                  src={getMediaUrl(n.media_url)}
                  alt=""
                  style={{ width: '100%', borderRadius: 10, marginBottom: 10, maxHeight: 180, objectFit: 'cover' }}
                  onError={e => e.target.style.display = 'none'}
                />
              )}
              {n.media_type === 'video' && n.media_url && (
                <div style={{
                  width: '100%', borderRadius: 10, marginBottom: 10,
                  background: 'var(--bg2)', padding: '10px 12px',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <Video size={16} style={{ color: 'var(--text3)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.media_url}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    {n.is_pinned && <span style={{ fontSize: 12 }}>📌</span>}
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{n.title}</p>
                  </div>
                  {n.content && (
                    <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 6,
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                    }}>
                      {n.content}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                      {new Date(n.created_at).toLocaleDateString('uz-UZ')}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Eye size={10} /> {n.views_count}
                    </span>
                    <span style={{
                      fontSize: 11, color: 'var(--text3)', background: 'var(--bg2)',
                      padding: '2px 7px', borderRadius: 6
                    }}>
                      {n.media_type}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => handlePin(n.id)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: n.is_pinned ? 'var(--primary-dim)' : 'var(--bg2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title={n.is_pinned ? 'Pin olib tashlash' : 'Pin qilish'}
                  >
                    {n.is_pinned
                      ? <PinOff size={14} style={{ color: 'var(--primary)' }} />
                      : <Pin size={14} style={{ color: 'var(--text3)' }} />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: 'var(--red-dim)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="O'chirish"
                  >
                    <Trash2 size={14} style={{ color: 'var(--red)' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
