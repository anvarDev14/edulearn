import { useState, useEffect, useRef } from 'react'
import { Send, Brain, MessageCircle, Lightbulb } from 'lucide-react'
import { aiAPI } from '../api'

export default function AIChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('chat')
  const [explainText, setExplainText] = useState('')
  const bottomRef = useRef()

  useEffect(() => {
    aiAPI.getHistory().then(r => {
      if (r.data?.length) setMessages(r.data)
      else setMessages([{ role: 'assistant', content: "Salom! 👋 Men EduLearn AI yordamchisiman. O'qish, darslar yoki mavzular haqida savollaringizni bering, javob beraman!" }])
    }).catch(() => {
      setMessages([{ role: 'assistant', content: "Salom! 👋 Men EduLearn AI yordamchisiman. O'qish, darslar yoki mavzular haqida savollaringizni bering, javob beraman!" }])
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const history = newMessages.slice(-8).map(m => ({ role: m.role, content: m.content }))
      const res = await aiAPI.chat(text, history.slice(0, -1))
      setMessages([...newMessages, { role: 'assistant', content: res.data.response }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: "⚠️ Xato yuz berdi. Qayta urinib ko'ring." }])
    } finally {
      setLoading(false)
    }
  }

  const sendExplain = async () => {
    if (!explainText.trim() || loading) return
    const text = explainText.trim()
    setExplainText('')
    setMode('chat')
    const userMsg = { role: 'user', content: `Tushuntir: "${text}"` }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)
    try {
      const res = await aiAPI.explain(text)
      setMessages([...newMessages, { role: 'assistant', content: res.data.explanation }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: '⚠️ Tushuntirishda xato.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: 'var(--nav-h)', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'var(--primary-dim)', border: '1.5px solid rgba(123,79,58,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>AI Yordamchi</p>
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>Ta'lim bo'yicha savol-javob</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setMode('chat')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: mode === 'chat' ? 'var(--primary)' : 'var(--bg2)',
                color: mode === 'chat' ? 'white' : 'var(--text2)',
                border: `1px solid ${mode === 'chat' ? 'transparent' : 'var(--border)'}`,
                transition: 'all 0.18s',
              }}
            >
              <MessageCircle size={13} /> Chat
            </button>
            <button
              onClick={() => setMode('explain')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: mode === 'explain' ? 'var(--primary)' : 'var(--bg2)',
                color: mode === 'explain' ? 'white' : 'var(--text2)',
                border: `1px solid ${mode === 'explain' ? 'transparent' : 'var(--border)'}`,
                transition: 'all 0.18s',
              }}
            >
              <Lightbulb size={13} /> Tushuntir
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '85%',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'user' ? 'var(--primary)' : 'var(--primary-dim)',
                  border: msg.role === 'assistant' ? '1.5px solid rgba(123,79,58,0.2)' : 'none',
                }}>
                  {msg.role === 'user'
                    ? <span style={{ fontSize: 13 }}>👤</span>
                    : <Brain size={14} style={{ color: 'var(--primary)' }} />
                  }
                </div>

                {/* Bubble */}
                <div style={{
                  padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                  color: msg.role === 'user' ? 'white' : 'var(--text)',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {/* Loading dots */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--primary-dim)', border: '1.5px solid rgba(123,79,58,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brain size={14} style={{ color: 'var(--primary)' }} />
              </div>
              <div style={{
                padding: '12px 16px', borderRadius: '16px 16px 16px 4px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--text3)', display: 'inline-block',
                    animation: 'pulse 1.2s infinite',
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid var(--border)', background: 'var(--surface)',
        padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {mode === 'explain' ? (
            <div>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Lightbulb size={12} /> Tushuntirish uchun matn kiriting:
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <textarea
                  value={explainText}
                  onChange={e => setExplainText(e.target.value)}
                  placeholder="Tushuntirib berishini istagan matnni yozing..."
                  style={{
                    flex: 1, padding: '10px 14px', resize: 'none', height: 80,
                    background: 'var(--bg2)', border: '1.5px solid var(--border)',
                    borderRadius: 14, color: 'var(--text)', fontSize: 14,
                    outline: 'none', fontFamily: 'var(--font)',
                  }}
                />
                <button
                  onClick={sendExplain}
                  disabled={loading || !explainText.trim()}
                  style={{
                    width: 46, borderRadius: 14, border: 'none', cursor: 'pointer',
                    background: 'var(--primary)', color: 'white', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: (loading || !explainText.trim()) ? 0.5 : 1,
                  }}
                >
                  <Brain size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Savolingizni yozing..."
                rows={1}
                style={{
                  flex: 1, padding: '11px 14px', resize: 'none',
                  background: 'var(--bg2)', border: '1.5px solid var(--border)',
                  borderRadius: 14, color: 'var(--text)', fontSize: 14,
                  outline: 'none', fontFamily: 'var(--font)',
                  maxHeight: 120, overflow: 'auto', lineHeight: 1.5,
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  width: 46, height: 46, borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: 'var(--primary)', color: 'white', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: (loading || !input.trim()) ? 0.5 : 1,
                  transition: 'opacity 0.18s',
                }}
              >
                {loading
                  ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  : <Send size={17} />
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
