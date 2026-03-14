import { useState, useEffect } from 'react'
import { friendsAPI, searchAPI } from '../api'

function Avatar({ user, size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary-light)', fontSize: size * 0.4, flexShrink: 0, overflow: 'hidden' }}>
      {user.photo_url
        ? <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : user.full_name?.[0] || '?'
      }
    </div>
  )
}

export default function Friends() {
  const [tab, setTab] = useState('friends')
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    Promise.all([
      friendsAPI.getFriends().then(r => setFriends(r.data)).catch(() => {}),
      friendsAPI.getRequests().then(r => setRequests(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const doSearch = async (q) => {
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    try {
      const res = await searchAPI.search(q)
      setSearchResults(res.data.users || [])
    } catch {} finally { setSearching(false) }
  }

  const sendRequest = async (userId) => {
    try {
      await friendsAPI.sendRequest(userId)
      showToast('✅ Do\'stlik so\'rovi yuborildi')
      setSearchResults(prev => prev.filter(u => u.id !== userId))
    } catch (e) {
      showToast(e.response?.data?.detail || '❌ Xato')
    }
  }

  const accept = async (friendshipId) => {
    try {
      await friendsAPI.acceptRequest(friendshipId)
      const accepted = requests.find(r => r.friendship_id === friendshipId)
      setRequests(prev => prev.filter(r => r.friendship_id !== friendshipId))
      if (accepted) setFriends(prev => [...prev, { ...accepted.user, friendship_id: friendshipId }])
      showToast('✅ Do\'stlik qabul qilindi')
    } catch {}
  }

  const remove = async (friendshipId) => {
    try {
      await friendsAPI.removeFriend(friendshipId)
      setFriends(prev => prev.filter(f => f.friendship_id !== friendshipId))
      showToast('Do\'stlikdan o\'chirildi')
    } catch {}
  }

  if (loading) return <div className="loader-full"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">👥 Do'stlar</h1>
        {requests.length > 0 && (
          <span className="badge badge-red">{requests.length} so'rov</span>
        )}
      </div>

      {/* Toast */}
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'friends' ? 'active' : ''}`} onClick={() => setTab('friends')}>
          👥 Do'stlar ({friends.length})
        </button>
        <button className={`tab ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
          📨 So'rovlar {requests.length > 0 ? `(${requests.length})` : ''}
        </button>
        <button className={`tab ${tab === 'find' ? 'active' : ''}`} onClick={() => setTab('find')}>
          🔍 Topish
        </button>
      </div>

      {/* Friends list */}
      {tab === 'friends' && (
        friends.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">👥</span>
            <p className="empty-title">Do'stlar yo'q</p>
            <p className="empty-desc">"Topish" yorlig'ida yangi do'stlar qo'shing</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {friends.map(f => (
              <div key={f.friendship_id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar user={f} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{f.full_name}</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                    {f.username && <span style={{ fontSize: 12, color: 'var(--text3)' }}>@{f.username}</span>}
                    <span className="badge badge-gold" style={{ fontSize: 10 }}>{f.total_xp} XP</span>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => remove(f.friendship_id)}>✕</button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Requests */}
      {tab === 'requests' && (
        requests.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">📨</span>
            <p className="empty-title">So'rov yo'q</p>
            <p className="empty-desc">Yangi do'stlik so'rovlari bu yerda ko'rinadi</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {requests.map(r => (
              <div key={r.friendship_id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar user={r.user} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{r.user.full_name}</p>
                  {r.user.username && <p style={{ fontSize: 12, color: 'var(--text3)' }}>@{r.user.username}</p>}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => accept(r.friendship_id)}>
                  ✓ Qabul
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Find friends */}
      {tab === 'find' && (
        <div>
          <div className="search-bar" style={{ marginBottom: 20 }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Ism yoki username..."
              value={searchQ}
              onChange={e => { setSearchQ(e.target.value); doSearch(e.target.value) }}
            />
            {searching && <div className="spinner" style={{ width: 16, height: 16 }} />}
          </div>

          {searchResults.length === 0 && searchQ && !searching && (
            <div className="empty">
              <span className="empty-icon">😕</span>
              <p className="empty-title">Topilmadi</p>
            </div>
          )}

          {!searchQ && (
            <div className="empty">
              <span className="empty-icon">🔍</span>
              <p className="empty-title">Foydalanuvchi qidiring</p>
              <p className="empty-desc">Ism yoki username bo'yicha qidiring</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {searchResults.map(u => (
              <div key={u.id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar user={u} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{u.full_name}</p>
                  {u.username && <p style={{ fontSize: 12, color: 'var(--text3)' }}>@{u.username}</p>}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => sendRequest(u.id)}>+ Do'st</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
