import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const refs = useRef([])
  const { loginWithCode } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  const handleChange = (i, val) => {
    const clean = val.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[i] = clean
    setDigits(newDigits)
    setError('')
    if (clean && i < 5) refs.current[i + 1]?.focus()
    if (newDigits.every(d => d !== '') && clean) {
      submitCode(newDigits.join(''))
    }
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      setTimeout(() => submitCode(pasted), 100)
    }
  }

  const submitCode = async (code) => {
    if (code.length !== 6) return
    setLoading(true)
    setError('')
    try {
      await loginWithCode(code)
      setSuccess(true)
      setTimeout(() => navigate('/'), 700)
    } catch (err) {
      setError(err.response?.data?.detail || "Noto'g'ri kod")
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => refs.current[0]?.focus(), 100)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-bg">
      <div className="login-blob b1" />
      <div className="login-blob b2" />

      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">🎓</div>
          <h1 className="logo-text">EduLearn</h1>
          <p className="logo-sub">O'quv platformasi</p>
        </div>

        <div className="tg-hint">
          <div className="tg-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.12 14.063l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.696.523z"/>
            </svg>
          </div>
          <div>
            <p className="tg-title">Telegram botdan kod oling</p>
            <p className="tg-desc">Botga <strong>/start</strong> yuboring</p>
          </div>
        </div>

        <p className="code-label">Kirish kodi</p>
        <div className="code-inputs" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`code-input${error ? ' err' : ''}${d ? ' filled' : ''}${success ? ' ok' : ''}`}
              disabled={loading || success}
            />
          ))}
        </div>

        {error && <p className="msg err-msg">⚠ {error}</p>}
        {loading && <p className="msg load-msg"><span className="spin" /> Tekshirilmoqda...</p>}
        {success && <p className="msg ok-msg">✓ Kirmoqdasiz...</p>}

        <div className="divider"><span>yoki</span></div>

        <a
          href="https://t.me/AS_subject_bot"
          target="_blank"
          rel="noreferrer"
          className="bot-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.12 14.063l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.696.523z"/>
          </svg>
          Telegram botga o'tish
        </a>

        <p className="footer-note">Birinchi marta? <strong>/start</strong> yuboring — ro'yxat avtomatik</p>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-bg {
          min-height: 100vh;
          background: #FDFAF6;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .login-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.18;
          animation: blobFloat 9s ease-in-out infinite;
        }
        .b1 { width: 380px; height: 380px; background: #C4956A; top: -120px; left: -80px; }
        .b2 { width: 320px; height: 320px; background: #7B4F3A; bottom: -100px; right: -60px; animation-delay: 4s; }
        @keyframes blobFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          40% { transform: translate(16px,-18px) scale(1.04); }
          70% { transform: translate(-8px,12px) scale(0.96); }
        }

        .login-card {
          background: rgba(255,253,249,0.88);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(120,80,60,0.12);
          border-radius: 24px;
          padding: 36px 28px;
          width: 100%;
          max-width: 400px;
          position: relative;
          z-index: 1;
          animation: cardIn 0.5s cubic-bezier(.22,.68,0,1.2);
          box-shadow: 0 8px 40px rgba(120,60,30,0.08);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .login-logo { text-align: center; margin-bottom: 28px; }
        .logo-icon {
          font-size: 44px; display: block; margin-bottom: 8px;
          animation: iconBounce 2.5s ease-in-out infinite;
        }
        @keyframes iconBounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .logo-text { font-size: 26px; font-weight: 800; color: #2C1A10; letter-spacing: -0.4px; }
        .logo-sub { font-size: 13px; color: rgba(44,26,16,0.45); margin-top: 3px; }

        .tg-hint {
          display: flex; align-items: center; gap: 12px;
          background: rgba(123,79,58,0.07);
          border: 1px solid rgba(123,79,58,0.15);
          border-radius: 14px;
          padding: 12px 14px;
          margin-bottom: 24px;
        }
        .tg-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: #7B4F3A; color: white;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .tg-title { font-size: 13px; font-weight: 600; color: #2C1A10; margin-bottom: 1px; }
        .tg-desc { font-size: 12px; color: rgba(44,26,16,0.5); }
        .tg-desc strong { color: rgba(44,26,16,0.75); }

        .code-label {
          display: block; font-size: 11px; font-weight: 700;
          color: rgba(44,26,16,0.45); text-transform: uppercase;
          letter-spacing: 1px; margin-bottom: 10px;
        }
        .code-inputs {
          display: flex; gap: 8px; justify-content: center;
          margin-bottom: 16px;
        }
        .code-input {
          width: 46px; height: 54px; text-align: center;
          font-size: 22px; font-weight: 700; color: #2C1A10;
          background: rgba(255,255,255,0.9);
          border: 1.5px solid rgba(120,80,60,0.18);
          border-radius: 12px; outline: none;
          transition: all 0.18s;
          -webkit-appearance: none;
        }
        .code-input:focus {
          border-color: #7B4F3A;
          background: white;
          box-shadow: 0 0 0 3px rgba(123,79,58,0.12);
          transform: scale(1.04);
        }
        .code-input.filled { border-color: rgba(123,79,58,0.45); background: white; }
        .code-input.err {
          border-color: #B94040 !important;
          background: rgba(185,64,64,0.06) !important;
          animation: shake 0.35s ease;
        }
        .code-input.ok { border-color: #3D7A55 !important; background: rgba(61,122,85,0.07) !important; }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .msg {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; text-align: center; justify-content: center;
          margin-bottom: 8px;
        }
        .err-msg { color: #B94040; }
        .ok-msg  { color: #3D7A55; }
        .load-msg { color: rgba(44,26,16,0.5); }
        .spin {
          display: inline-block; width: 14px; height: 14px;
          border: 2px solid rgba(44,26,16,0.15);
          border-top-color: #7B4F3A; border-radius: 50%;
          animation: spinIt 0.7s linear infinite;
        }
        @keyframes spinIt { to { transform: rotate(360deg); } }

        .divider {
          display: flex; align-items: center; gap: 10px;
          margin: 18px 0 14px; color: rgba(44,26,16,0.3); font-size: 12px;
        }
        .divider::before,.divider::after {
          content:''; flex:1; height:1px; background:rgba(120,80,60,0.12);
        }

        .bot-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 12px;
          background: rgba(123,79,58,0.08);
          border: 1px solid rgba(123,79,58,0.18);
          border-radius: 12px;
          color: #7B4F3A; font-size: 14px; font-weight: 600;
          text-decoration: none; transition: all 0.18s;
          margin-bottom: 18px;
        }
        .bot-btn:hover { background: rgba(123,79,58,0.14); transform: translateY(-1px); }

        .footer-note {
          text-align: center; font-size: 12px;
          color: rgba(44,26,16,0.35); line-height: 1.5;
        }
        .footer-note strong { color: rgba(44,26,16,0.55); }

        @media (max-width: 380px) {
          .login-card { padding: 28px 18px; }
          .code-input { width: 40px; height: 48px; font-size: 18px; }
        }
      `}</style>
    </div>
  )
}
