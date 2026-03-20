import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, Crown } from 'lucide-react'
import { booksAPI } from '../api'
import { useAuth } from '../context/AuthContext'

export default function BookCategory() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    booksAPI.getCategoryBooks(categoryId)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [categoryId])

  if (loading) return <div className="loader-full"><div className="spinner" /></div>
  if (!data) return null

  const { category, books } = data

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => navigate('/books')} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>
          ← Orqaga
        </button>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
            {category.emoji} {category.title}
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Kitoblar</h1>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <BookOpen size={40} style={{ color: 'var(--text3)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Bu kategoriyada hozircha kitob yo'q</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {books.map(book => {
            const locked = book.is_premium && !user?.is_premium
            return (
              <div
                key={book.id}
                className="card"
                style={{ cursor: locked ? 'default' : 'pointer', padding: 12, opacity: locked ? 0.85 : 1 }}
                onClick={() => !locked && navigate(`/books/detail/${book.id}`)}
              >
                {/* Cover */}
                <div style={{
                  width: '100%', aspectRatio: '2/3', borderRadius: 10,
                  background: book.cover_url ? 'transparent' : 'var(--accent-dim)',
                  overflow: 'hidden', marginBottom: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {book.cover_url
                    ? <img src={book.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 40 }}>📖</span>
                  }
                </div>

                <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 3, lineHeight: 1.3 }}>
                  {book.title}
                </p>
                {book.author && (
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{book.author}</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {book.pages && (
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{book.pages} bet</span>
                  )}
                  {locked && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Crown size={12} style={{ color: 'var(--gold)' }} />
                      <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>Premium</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
