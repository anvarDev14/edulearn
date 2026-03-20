import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pin, Eye, Play } from 'lucide-react'
import { newsAPI, getMediaUrl } from '../api'
import Loader from '../components/common/Loader'

export default function NewsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNews()
  }, [id])

  const loadNews = async () => {
    try {
      const res = await newsAPI.getById(id)
      setNews(res.data)
    } catch (error) {
      console.error('Error:', error)
      navigate('/news')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />
  if (!news) return null

  return (
    <div className="page">
      <button
        onClick={() => navigate('/news')}
        style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginBottom: 20, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ArrowLeft size={18} /> Yangiliklar
      </button>

      {news.media_url && news.media_type === 'image' && (
        <img
          src={getMediaUrl(news.media_url)}
          alt={news.title}
          style={{ width: '100%', borderRadius: 'var(--radius)', marginBottom: 20, objectFit: 'cover', maxHeight: 240 }}
        />
      )}

      {news.media_url && news.media_type === 'video' && (
        <div style={{ position: 'relative', paddingBottom: '56.25%', marginBottom: 20, borderRadius: 'var(--radius)', overflow: 'hidden', background: '#000' }}>
          <iframe
            src={news.media_url}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            allowFullScreen
            title={news.title}
          />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.3px', flex: 1 }}>{news.title}</h1>
        {news.is_pinned && <Pin size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, fontSize: 12, color: 'var(--text3)' }}>
        <span>{new Date(news.created_at).toLocaleDateString('uz-UZ')}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Eye size={13} /> {news.views_count}
        </span>
        {news.media_type === 'video' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Play size={13} /> Video
          </span>
        )}
      </div>

      {news.content && (
        <div className="card" style={{ lineHeight: 1.75, fontSize: 14, color: 'var(--text2)', whiteSpace: 'pre-line' }}>
          {news.content}
        </div>
      )}
    </div>
  )
}
