import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Brain, MessageCircle, Lightbulb, RotateCcw } from 'lucide-react'
import { aiAPI } from '../api'

const WELCOME = "Salom! 👋 Men EduLearn AI yordamchisiman. O'qish, darslar yoki mavzular haqida savollaringizni bering, javob beraman!"

export default function AIChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('chat')
  const [explainText, setExplainText] = useState('')
  const bottomRef = useRef()
  const textareaRef = useRef()

  useEffect(() => {
    aiAPI.getHistory().then(r => {
      if (r.data?.length) setMessages(r.data)
      else setMessages([{ role: 'assistant', content: WELCOME }])
    }).catch(() => {
      setMessages([{ role: 'assistant', content: WELCOME }])
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
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

  const autoResize = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: WELCOME }])
  }

  const quickPrompts = [
    "Algebra nima?",
    "Kvadrat tenglama qanday yechiladi?",
    "Python dasturlash tili haqida",
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', paddingBottom: 'var(--nav-h)',
      background: 'var(--bg)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(5,6,10,0.97)',
        backdropFilter: 'blur(24px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--primary-dim), var(--accent-dim))',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={20} color="var(--primary-light)" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 16 }}>AI Yordamchi</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>Ta'lim bo'yicha savol-javob</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <ModeBtn icon={MessageCircle} label="Chat" active={mode === 'chat'} onClick={() => setMode('chat')} />
            <ModeBtn icon={Lightbulb} label="Tushuntir" active={mode === 'explain'} onClick={() => setMode('explain')} />
          </div>
          <button
            onClick={clearChat}
            title="Tozalash"
            style={{
              width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        maxWidth: 800, margin: '0 auto', width: '100%',
      }}>
        {/* Quick prompts - show when only welcome message */}
        {messages.length === 1 && messages[0].role === 'assistant' && mode === 'chat' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: 20 }}
          >
            <p style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
              Tezkor savollar
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(p); textareaRef.current?.focus() }}
                  style={{
                    textAlign: 'left', padding: '10px 14px', borderRadius: 12,
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    color: 'var(--text2)', fontSize: 13, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  💬 {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '88%',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                    : 'var(--surface2)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>
                  {msg.role === 'user' ? '👤' : <Brain size={14} color="var(--primary-light)" />}
                </div>

                {/* Bubble */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, var(--primary), #1d4ed8)'
                    : 'var(--surface)',
                  border: `1px solid ${msg.role === 'user' ? 'transparent' : 'var(--border)'}`,
                  color: 'var(--text)',
                  fontSize: 14, lineHeight: 1.65,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  boxShadow: msg.role === 'user' ? '0 4px 16px rgba(37,99,235,0.3)' : 'none',
                }}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--surface2)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brain size={14} color="var(--primary-light)" />
              </div>
              <div style={{
                padding: '14px 18px', borderRadius: '18px 18px 18px 4px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                display: 'flex', gap: 5, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                    style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'var(--primary-light)', display: 'inline-block',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        borderTop: '1px solid var(--border)',
        background: 'rgba(5,6,10,0.97)',
        backdropFilter: 'blur(24px)',
        padding: '12px 16px',
        paddingBottom: `calc(12px + env(safe-area-inset-bottom))`,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            {mode === 'explain' ? (
              <motion.div
                key="explain"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <p style={{
                  fontSize: 12, color: 'var(--primary-light)', marginBottom: 8,
                  fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <Lightbulb size={13} /> Tushuntirish rejimi — matn yoki mavzuni kiriting
                </p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <textarea
                    value={explainText}
                    onChange={e => setExplainText(e.target.value)}
                    placeholder="Tushuntirib berishini istagan matn yoki mavzuni yozing..."
                    className="input"
                    style={{ resize: 'none', height: 80, borderRadius: 14, flex: 1 }}
                  />
                  <button
                    onClick={sendExplain}
                    disabled={loading || !explainText.trim()}
                    className="btn btn-primary"
                    style={{ borderRadius: 14, height: 80, width: 52, padding: 0, flexShrink: 0 }}
                  >
                    {loading
                      ? <div className="spinner" style={{ width: 16, height: 16 }} />
                      : <Lightbulb size={18} />
                    }
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => { setInput(e.target.value); autoResize(e) }}
                  onKeyDown={handleKey}
                  placeholder="Savolingizni yozing... (Enter — yuborish)"
                  className="input"
                  rows={1}
                  style={{
                    resize: 'none', borderRadius: 14, flex: 1,
                    maxHeight: 120, overflow: 'auto',
                    paddingTop: 13, paddingBottom: 13, lineHeight: 1.5,
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  style={{
                    width: 48, height: 48, borderRadius: 14, border: 'none',
                    background: input.trim() && !loading
                      ? 'linear-gradient(135deg, var(--primary), #1d4ed8)'
                      : 'var(--surface2)',
                    color: input.trim() && !loading ? 'white' : 'var(--text3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s', flexShrink: 0,
                    boxShadow: input.trim() && !loading ? '0 4px 16px rgba(37,99,235,0.35)' : 'none',
                  }}
                >
                  {loading
                    ? <div className="spinner" style={{ width: 16, height: 16 }} />
                    : <Send size={18} />
                  }
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function ModeBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '7px 12px', borderRadius: 10, border: 'none',
        background: active ? 'var(--primary-dim)' : 'transparent',
        color: active ? 'var(--primary-light)' : 'var(--text3)',
        fontWeight: 600, fontSize: 12, cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}
