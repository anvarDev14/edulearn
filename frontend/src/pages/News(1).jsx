import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Pin, Eye, Play, Image } from 'lucide-react'
import { newsAPI } from '../api'
import Loader from '../components/common/Loader'

export default function News() {
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
  
  const getMediaIcon = (type) => {
    if (type === 'video') return <Play size={16} />
    if (type === 'image') return <Image size={16} />
    return null
  }
  
  if (loading) return <Loader />
  
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">📰 Yangiliklar</h1>
      
      <div className="space-y-4">
        {news.map((item, i) => (
          <motion.div
            key={item.id}
            className="bg-slate-800 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            {item.media_url && item.media_type === 'image' && (
              <img 
                src={item.media_url} 
                alt={item.title}
                className="w-full h-48 object-cover"
              />
            )}
            
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold">{item.title}</h3>
                {item.is_pinned && <Pin size={16} className="text-blue-500 flex-shrink-0" />}
              </div>
              
              {item.content && (
                <p className="text-slate-400 text-sm line-clamp-3 mb-3">{item.content}</p>
              )}
              
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-3">
                  {getMediaIcon(item.media_type)}
                  <span className="flex items-center gap-1">
                    <Eye size={14} /> {item.views_count}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {news.length === 0 && (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">📭</p>
            <p className="text-slate-400">Hozircha yangiliklar yo'q</p>
          </div>
        )}
      </div>
    </div>
  )
}
