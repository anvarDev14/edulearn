import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swords, Plus, Users, Trophy, Clock, RefreshCw, X, ChevronRight } from 'lucide-react'
import { battleAPI, lessonsAPI } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Battle() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [tab, setTab] = useState('lobbies')   // lobbies | create | history
  const [lobbies, setLobbies] = useState([])
  const [history, setHistory] = useState([])
  const [modules, setModules] = useState([])
  const [selectedModule, setSelectedModule] = useState(null)
  const [activeBattle, setActiveBattle] = useState(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(null)

  const loadLobbies = useCallback(async () => {
    try {
      const res = await battleAPI.getLobbies()
      setLobbies(res.data)
    } catch {}
  }, [])

  const checkActive = useCallback(async () => {
    try {
      const res = await battleAPI.getActive()
      if (res.data) {
        setActiveBattle(res.data)
        if (res.data.status === 'active') {
          navigate(`/battle/${res.data.id}`)
        }
      } else {
        setActiveBattle(null)
      }
    } catch {}
  }, [navigate])

  useEffect(() => {
    checkActive()
    loadLobbies()
    lessonsAPI.getModules().then(r => setModules(r.data)).catch(() => {})
    battleAPI.getHistory().then(r => setHistory(r.data)).catch(() => {})
  }, [])

  // Poll active battle every 3s
  useEffect(() => {
    const t = setInterval(checkActive, 3000)
    return () => clearInterval(t)
  }, [checkActive])

  const handleCreate = async () => {
    if (!selectedModule) return alert("Modul tanlang")
    setCreating(true)
    try {
      const res = await battleAPI.create(selectedModule)
      setActiveBattle({ id: res.data.id, status: 'waiting', module_title: res.data.module_title })
      setTab('lobbies')
    } catch (e) {
      alert(e.response?.data?.detail || "Xatolik")
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async (battleId) => {
    setJoining(battleId)
    try {
      await battleAPI.join(battleId)
      navigate(`/battle/${battleId}`)
    } catch (e) {
      alert(e.response?.data?.detail || "Xatolik")
      loadLobbies()
    } finally {
      setJoining(null)
    }
  }

  const handleCancel = async () => {
    if (!activeBattle) return
    try {
      await battleAPI.cancel(activeBattle.id)
      setActiveBattle(null)
    } catch {}
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 2 }}>
          Raqobat
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚔️ Jang maydoni
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 3 }}>1v1 quiz bellashuvi</p>
      </div>

      {/* Active battle banner */}
      {activeBattle && (
        <div className="card" style={{
          marginBottom: 16,
          background: activeBattle.status === 'active' ? 'var(--green-dim)' : 'var(--gold-dim)',
          borderColor: activeBattle.status === 'active' ? 'rgba(0,160,0,0.2)' : 'rgba(184,115,51,0.25)',
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px'
        }}>
          <span style={{ fontSize: 24 }}>
            {activeBattle.status === 'active' ? '⚔️' : '⏳'}
          </span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
              {activeBattle.status === 'active' ? 'Jang boshlandi!' : 'Raqib kutilmoqda...'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>{activeBattle.module_title}</p>
          </div>
          {activeBattle.status === 'active' ? (
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/battle/${activeBattle.id}`)}>
              Kirish
            </button>
          ) : (
            <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
              <X size={18} style={{ color: 'var(--text3)' }} />
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, background: 'var(--bg2)', borderRadius: 14, padding: 4, border: '1px solid var(--border)' }}>
        {[
          { key: 'lobbies', label: '🏟️ Lobbylar' },
          { key: 'create', label: '➕ Yaratish' },
          { key: 'history', label: '🏆 Natijalar' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '8px 4px', borderRadius: 11, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 12, transition: 'all 0.18s',
            background: tab === t.key ? 'var(--surface)' : 'transparent',
            color: tab === t.key ? 'var(--primary)' : 'var(--text3)',
            boxShadow: tab === t.key ? '0 1px 6px rgba(0,0,0,0.07)' : 'none',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* LOBBIES tab */}
      {tab === 'lobbies' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button onClick={loadLobbies} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)', fontSize: 13 }}>
              <RefreshCw size={14} /> Yangilash
            </button>
          </div>

          {lobbies.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>🏟️</p>
              <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Hozircha ochiq lobby yo'q</p>
              <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>O'zingiz lobby yarating!</p>
              <button className="btn btn-primary btn-sm" onClick={() => setTab('create')}>
                <Plus size={14} /> Lobby yaratish
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lobbies.map(b => (
                <div key={b.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {b.module_emoji || '📚'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{b.creator_name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text3)' }}>{b.module_title}</p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleJoin(b.id)}
                    disabled={joining === b.id || !!activeBattle}
                  >
                    {joining === b.id ? '...' : '⚔️ Jang'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE tab */}
      {tab === 'create' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>
            Modul tanlang — raqibingiz xuddi shu moduldan savollarga javob beradi:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {modules.map(m => (
              <div
                key={m.id}
                onClick={() => setSelectedModule(m.id)}
                className="card"
                style={{
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderColor: selectedModule === m.id ? 'var(--primary)' : 'var(--border)',
                  background: selectedModule === m.id ? 'var(--primary-dim)' : 'var(--surface)',
                }}
              >
                <span style={{ fontSize: 22 }}>{m.emoji || '📚'}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{m.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text3)' }}>{m.total_lessons || 0} dars</p>
                </div>
                {selectedModule === m.id && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: 12 }}>✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="card" style={{ background: 'var(--bg2)', marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>
              🎯 Lobby yaratganingizdan keyin boshqa user sizga qo'shilishini kuting.<br />
              ⚔️ Ikki kishi ham tayyor bo'lganda jang boshlanadi.<br />
              🏆 Ko'proq to'g'ri javob bergan yutadi — va XP oladi!
            </p>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={handleCreate}
            disabled={creating || !selectedModule || !!activeBattle}
          >
            {creating ? 'Yaratilmoqda...' : '🏟️ Lobby yaratish'}
          </button>
          {activeBattle && (
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--red)', marginTop: 8 }}>
              Avval joriy lobbiyingizni bekor qiling
            </p>
          )}
        </div>
      )}

      {/* HISTORY tab */}
      {tab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>🏆</p>
              <p style={{ color: 'var(--text3)', fontSize: 14 }}>Hali janglarda qatnashmadingiz</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map(b => (
                <div key={b.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                    background: b.won ? 'var(--green-dim)' : b.draw ? 'var(--gold-dim)' : 'var(--red-dim)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    {b.won ? '🏆' : b.draw ? '🤝' : '💔'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                      vs {b.opponent_name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text3)' }}>{b.module_emoji} {b.module_title}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, fontSize: 16, color: b.won ? 'var(--green)' : b.draw ? 'var(--gold)' : 'var(--red)' }}>
                      {b.my_score} – {b.opponent_score}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text3)' }}>
                      {b.won ? 'G\'alaba' : b.draw ? 'Durrang' : 'Mag\'lubiyat'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
