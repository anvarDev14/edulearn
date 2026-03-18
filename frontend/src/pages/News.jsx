import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pin, Eye, Play, Image as ImageIcon, ChevronRight } from 'lucide-react'
import { newsAPI } from '../api'
import Loader from '../components/common/Loader'

export default function News() {
  const navigate = useNavigate()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      const res = await newsAPI.getAll()
      setNews(res.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="page">
      <div className="page-header">
        <span className="emoji-soft" style={{ fontSize: 26 }}>📰</span>
        <div>
          <h1 className="page-title">Yangiliklar</h1>
          <p className="page-subtitle">So'ngi xabarlar va e'lonlar</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {news.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(`/news/${item.id}`)}
            className="card"
            style={{
              textAlign: 'left', cursor: 'pointer', padding: 0,
              overflow: 'hidden', width: '100%',
              animation: `fadeIn 0.3s ease ${i * 0.04}s both`,
            }}
          >
            {item.media_url && item.media_type === 'image' && (
              <img
                src={item.media_url}
                alt={item.title}
                style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
              />
            )}
            <div style={{ padding: '14px 15px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4, flex: 1 }}>{item.title}</h3>
                {item.is_pinned && <Pin size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />}
              </div>

              {item.content && (
                <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.content}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)' }}>
                <span>{new Date(item.created_at).toLocaleDateString('uz-UZ')}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {item.media_type === 'video' && <Play size={13} />}
                  {item.media_type === 'image' && <ImageIcon size={13} />}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Eye size={13} /> {item.views_count}
                  </span>
                  <ChevronRight size={13} />
                </div>
              </div>
            </div>
          </button>
        ))}

        {news.length === 0 && (
          <div className="empty">
            <span className="empty-icon">📭</span>
            <p className="empty-title">Yangiliklar yo'q</p>
            <p className="empty-desc">Hozircha yangiliklar qo'shilmagan</p>
          </div>
        )}
      </div>
    </div>
  )
}
