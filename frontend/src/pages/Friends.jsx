import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Mail, Search, UserPlus, X, Check, Loader2, UserCheck } from 'lucide-react'
import { friendsAPI, searchAPI } from '../api'

function Avatar({ user, size = 44 }) {
  const colors = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626']
  const color = colors[(user.full_name?.charCodeAt(0) || 0) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: user.photo_url ? 'transparent' : color + '22',
      border: `2px solid ${user.photo_url ? 'transparent' : color + '44'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, color: color, fontSize: size * 0.38,
      flexShrink: 0, overflow: 'hidden',
    }}>
      {user.photo_url
        ? <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : (user.full_name?.[0] || '?').toUpperCase()
      }
    </div>
  )
}

const tabs = [
  { key: 'friends', icon: Users, label: "Do'stlar" },
  { key: 'requests', icon: Mail, label: "So'rovlar" },
  { key: 'find', icon: Search, label: 'Topish' },
]

export default function Friends() {
  const [tab, setTab] = useState('friends')
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [toast, setToast] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

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
    setActionLoading(userId)
    try {
      await friendsAPI.sendRequest(userId)
      showToast("✅ Do'stlik so'rovi yuborildi")
      setSearchResults(prev => prev.filter(u => u.id !== userId))
    } catch (e) {
      showToast(e.response?.data?.detail || '❌ Xato')
    } finally { setActionLoading(null) }
  }

  const accept = async (friendshipId) => {
    setActionLoading(friendshipId)
    try {
      await friendsAPI.acceptRequest(friendshipId)
      const accepted = requests.find(r => r.friendship_id === friendshipId)
      setRequests(prev => prev.filter(r => r.friendship_id !== friendshipId))
      if (accepted) setFriends(prev => [...prev, { ...accepted.user, friendship_id: friendshipId }])
      showToast("✅ Do'stlik qabul qilindi")
    } catch {} finally { setActionLoading(null) }
  }

  const remove = async (friendshipId) => {
    setActionLoading(friendshipId)
    try {
      await friendsAPI.removeFriend(friendshipId)
      setFriends(prev => prev.filter(f => f.friendship_id !== friendshipId))
      showToast("Do'stlikdan o'chirildi")
    } catch {} finally { setActionLoading(null) }
  }

  if (loading) return (
    <div className="loader-full">
      <div className="spinner" />
    </div>
  )

  return (
    <div className="page">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--surface2)', border: '1px solid var(--border2)',
              padding: '10px 20px', borderRadius: 50, fontSize: 14, fontWeight: 600,
              zIndex: 999, whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: 'var(--primary-dim)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Users size={20} color="var(--primary-light)" />
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Do'stlar</h1>
            <p className="page-subtitle">{friends.length} do'st</p>
          </div>
        </div>
        {requests.length > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="badge badge-red"
          >
            {requests.length} yangi
          </motion.span>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 20,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 5
      }}>
        {tabs.map(t => {
          const isActive = tab === t.key
          const count = t.key === 'requests' ? requests.length : t.key === 'friends' ? friends.length : null
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '9px 8px', borderRadius: 10, border: 'none',
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--text3)',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <t.icon size={15} />
              {t.label}
              {count != null && count > 0 && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--red-dim)',
                  color: isActive ? 'white' : 'var(--red)',
                  borderRadius: 50, padding: '0px 7px', fontSize: 11, fontWeight: 700
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18 }}
        >
          {/* Friends Tab */}
          {tab === 'friends' && (
            friends.length === 0 ? (
              <EmptyState icon="👥" title="Do'stlar yo'q" desc='"Topish" bo\'limida yangi do\'stlar qo\'shing' />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {friends.map((f, i) => (
                  <motion.div
                    key={f.friendship_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card card-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <Avatar user={f} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 15 }}>{f.full_name}</p>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
                        {f.username && <span style={{ fontSize: 12, color: 'var(--text3)' }}>@{f.username}</span>}
                        <span className="badge badge-gold" style={{ fontSize: 10 }}>⚡ {f.total_xp || 0} XP</span>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(f.friendship_id)}
                      disabled={actionLoading === f.friendship_id}
                      style={{
                        width: 34, height: 34, borderRadius: 10, border: 'none',
                        background: 'var(--red-dim)', color: 'var(--red)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      {actionLoading === f.friendship_id
                        ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                        : <X size={14} />
                      }
                    </button>
                  </motion.div>
                ))}
              </div>
            )
          )}

          {/* Requests Tab */}
          {tab === 'requests' && (
            requests.length === 0 ? (
              <EmptyState icon="📨" title="So'rov yo'q" desc="Yangi do'stlik so'rovlari bu yerda ko'rinadi" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  Kiruvchi so'rovlar
                </p>
                {requests.map((r, i) => (
                  <motion.div
                    key={r.friendship_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card card-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <Avatar user={r.user} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 15 }}>{r.user.full_name}</p>
                      {r.user.username && <p style={{ fontSize: 12, color: 'var(--text3)' }}>@{r.user.username}</p>}
                    </div>
                    <button
                      onClick={() => accept(r.friendship_id)}
                      disabled={actionLoading === r.friendship_id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px', borderRadius: 10, border: 'none',
                        background: 'var(--green-dim)', color: 'var(--green)',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      {actionLoading === r.friendship_id
                        ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                        : <><Check size={14} /> Qabul</>
                      }
                    </button>
                  </motion.div>
                ))}
              </div>
            )
          )}

          {/* Find Tab */}
          {tab === 'find' && (
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--surface)', border: '1.5px solid var(--border)',
                borderRadius: 14, padding: '12px 16px', marginBottom: 20,
                transition: 'border-color 0.2s',
              }}
                onFocus={() => {}}
              >
                {searching
                  ? <Loader2 size={18} color="var(--primary-light)" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  : <Search size={18} color="var(--text3)" style={{ flexShrink: 0 }} />
                }
                <input
                  type="text"
                  placeholder="Ism yoki username bo'yicha qidiring..."
                  value={searchQ}
                  onChange={e => { setSearchQ(e.target.value); doSearch(e.target.value) }}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--text)', fontSize: 14,
                  }}
                  autoFocus
                />
                {searchQ && (
                  <button onClick={() => { setSearchQ(''); setSearchResults([]) }}
                    style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <X size={16} />
                  </button>
                )}
              </div>

              {!searchQ && <EmptyState icon="🔍" title="Foydalanuvchi qidiring" desc="Ism yoki username bo'yicha qidiring" />}
              {searchQ && !searching && searchResults.length === 0 && <EmptyState icon="😕" title="Topilmadi" desc={`"${searchQ}" bo'yicha foydalanuvchi topilmadi`} />}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {searchResults.map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card card-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <Avatar user={u} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 15 }}>{u.full_name}</p>
                      {u.username && <p style={{ fontSize: 12, color: 'var(--text3)' }}>@{u.username}</p>}
                    </div>
                    <button
                      onClick={() => sendRequest(u.id)}
                      disabled={actionLoading === u.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px', borderRadius: 10, border: 'none',
                        background: 'var(--primary-dim)', color: 'var(--primary-light)',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      {actionLoading === u.id
                        ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                        : <><UserPlus size={14} /> Do'st</>
                      }
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function EmptyState({ icon, title, desc }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="empty"
    >
      <span className="empty-icon emoji-soft">{icon}</span>
      <p className="empty-title">{title}</p>
      {desc && <p className="empty-desc">{desc}</p>}
    </motion.div>
  )
}
