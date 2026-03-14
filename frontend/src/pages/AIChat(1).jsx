import { useState, useEffect, useRef } from 'react'
import { aiAPI } from '../api'

export default function AIChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('chat') // chat | explain
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
      setMessages([...newMessages, { role: 'assistant', content: '⚠️ Xato yuz berdi. Qayta urinib ko\'ring.' }])
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
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧠</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16 }}>AI Yordamchi</p>
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>Ta'lim bo'yicha savol-javob</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button className={`btn btn-sm ${mode === 'chat' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('chat')}>💬 Chat</button>
            <button className={`btn btn-sm ${mode === 'explain' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('explain')}>🧠 Tushuntir</button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '85%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {msg.role === 'user' ? '👤' : '🧠'}
                </div>
                <div className={`chat-bubble ${msg.role}`} style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🧠</div>
              <div className="chat-bubble assistant" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '12px 16px' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)', display: 'inline-block', animation: 'pulse 1.2s infinite', animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid var(--border)', background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(20px)', padding: '12px 16px', paddingBottom: `calc(12px + env(safe-area-inset-bottom))` }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {mode === 'explain' ? (
            <div>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>🧠 Tushuntirish uchun matn kiriting:</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <textarea
                  value={explainText}
                  onChange={e => setExplainText(e.target.value)}
                  placeholder="Tushuntirib berishini istagan matnni yozing..."
                  className="input"
                  style={{ resize: 'none', height: 80, borderRadius: 14 }}
                />
                <button className="btn btn-primary" onClick={sendExplain} disabled={loading || !explainText.trim()}>
                  🧠
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Savolingizni yozing..."
                className="input"
                rows={1}
                style={{ resize: 'none', borderRadius: 14, maxHeight: 120, overflow: 'auto', paddingTop: 12, paddingBottom: 12, lineHeight: 1.5 }}
              />
              <button
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{ borderRadius: 14, height: 46, width: 46, padding: 0, flexShrink: 0 }}
              >
                {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : '→'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
