import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, Crown, Download, ExternalLink } from 'lucide-react'
import { booksAPI } from '../api'

export default function BookDetail() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    booksAPI.getBook(bookId)
      .then(r => setBook(r.data))
      .catch(err => {
        if (err.response?.status === 403) setError('premium')
        else setError('notfound')
      })
      .finally(() => setLoading(false))
  }, [bookId])

  if (loading) return <div className="loader-full"><div className="spinner" /></div>

  if (error === 'premium') {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Crown size={48} style={{ color: 'var(--gold)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Premium Kontent</h2>
        <p style={{ color: 'var(--text3)', textAlign: 'center', marginBottom: 24 }}>
          Bu kitob faqat premium foydalanuvchilar uchun
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/premium')}>Premium olish</button>
        <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => navigate(-1)}>Orqaga</button>
      </div>
    )
  }

  if (!book) return null

  const isPdf = book.file_url?.toLowerCase().includes('.pdf')

  return (
    <div className="page">
      <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>
        ← Orqaga
      </button>

      {/* Cover */}
      <div style={{
        width: 160, height: 240, borderRadius: 16,
        overflow: 'hidden', margin: '0 auto 24px',
        background: book.cover_url ? 'transparent' : 'var(--accent-dim)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        {book.cover_url
          ? <img src={book.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 64 }}>📖</span>
        }
      </div>

      {/* Info */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>{book.title}</h1>
        {book.author && <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 4 }}>✍️ {book.author}</p>}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
          {book.language && (
            <span style={{ fontSize: 12, color: 'var(--text3)', background: 'var(--bg2)', padding: '3px 10px', borderRadius: 8 }}>
              🌐 {book.language}
            </span>
          )}
          {book.pages && (
            <span style={{ fontSize: 12, color: 'var(--text3)', background: 'var(--bg2)', padding: '3px 10px', borderRadius: 8 }}>
              📄 {book.pages} bet
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{book.description}</p>
        </div>
      )}

      {/* Actions */}
      {book.file_url && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isPdf ? (
            <a
              href={book.file_url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
            >
              <BookOpen size={18} />
              O'qish (PDF)
            </a>
          ) : (
            <a
              href={book.file_url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
            >
              <ExternalLink size={18} />
              Ochish
            </a>
          )}
          <a
            href={book.file_url}
            download
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
          >
            <Download size={18} />
            Yuklab olish
          </a>
        </div>
      )}

      {!book.file_url && (
        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Kitob fayli hali qo'shilmagan</p>
        </div>
      )}
    </div>
  )
}
