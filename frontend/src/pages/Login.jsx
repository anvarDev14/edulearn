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
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      setError(err.response?.data?.detail || 'Noto\'g\'ri kod')
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => refs.current[0]?.focus(), 100)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-bg">
      {/* Animated background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon">🎓</div>
          <h1 className="logo-text">EduLearn</h1>
          <p className="logo-sub">Gamified O'quv Platformasi</p>
        </div>

        {/* Telegram hint */}
        <div className="tg-hint">
          <div className="tg-hint-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.12 14.063l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.696.523z"/>
            </svg>
          </div>
          <div>
            <p className="tg-hint-title">Telegram botdan kod oling</p>
            <p className="tg-hint-desc">Botga <strong>/start</strong> yuboring va 6 raqamli kodni kiriting</p>
          </div>
        </div>

        {/* Code input */}
        <div className="code-section">
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
                className={`code-input ${error ? 'error' : ''} ${d ? 'filled' : ''} ${success ? 'success' : ''}`}
                disabled={loading || success}
              />
            ))}
          </div>

          {error && (
            <div className="error-msg">
              <span>⚠️</span> {error}
            </div>
          )}

          {loading && (
            <div className="loading-row">
              <div className="spinner" />
              <span>Tekshirilmoqda...</span>
            </div>
          )}

          {success && (
            <div className="success-msg">
              <span>✅</span> Muvaffaqiyatli! Kirmoqdasiz...
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="divider">
          <span>yoki</span>
        </div>

        {/* Bot link */}
        <a
          href="https://t.me/AS_subject_bot"
          target="_blank"
          rel="noreferrer"
          className="bot-link"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.12 14.063l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.696.523z"/>
          </svg>
          Telegram botga o'tish
        </a>

        <p className="login-footer">
          Birinchi marta? Botga <strong>/start</strong> yuboring — ro'yxatdan o'tish avtomatik
        </p>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-bg {
          min-height: 100vh;
          background: #0a0a14;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          animation: float 8s ease-in-out infinite;
        }
        .blob-1 {
          width: 400px; height: 400px;
          background: #6366f1;
          top: -100px; left: -100px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 350px; height: 350px;
          background: #8b5cf6;
          bottom: -80px; right: -80px;
          animation-delay: 3s;
        }
        .blob-3 {
          width: 300px; height: 300px;
          background: #06b6d4;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 6s;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-10px, 15px) scale(0.95); }
        }

        .login-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: 40px 36px;
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
          animation: slideUp 0.6s cubic-bezier(.22,.68,0,1.2);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-logo {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo-icon {
          font-size: 48px;
          margin-bottom: 8px;
          display: block;
          animation: bounce 2s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .logo-text {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
        }
        .logo-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-top: 4px;
        }

        .tg-hint {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(37, 99, 235, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          padding: 14px 16px;
          margin-bottom: 28px;
        }
        .tg-hint-icon {
          width: 40px; height: 40px;
          background: #2563eb;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .tg-hint-title {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          margin-bottom: 2px;
        }
        .tg-hint-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
        }
        .tg-hint-desc strong { color: rgba(255,255,255,0.75); }

        .code-section { margin-bottom: 24px; }
        .code-label {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        .code-inputs {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .code-input {
          width: 48px;
          height: 58px;
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          outline: none;
          transition: all 0.2s;
          -webkit-appearance: none;
        }
        .code-input:focus {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
          transform: scale(1.05);
        }
        .code-input.filled {
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(99, 102, 241, 0.08);
        }
        .code-input.error {
          border-color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.08) !important;
          animation: shake 0.4s ease;
        }
        .code-input.success {
          border-color: #10b981 !important;
          background: rgba(16, 185, 129, 0.1) !important;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        .error-msg {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #f87171;
          font-size: 13px;
          margin-top: 12px;
          text-align: center;
          justify-content: center;
        }
        .success-msg {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #34d399;
          font-size: 13px;
          margin-top: 12px;
          text-align: center;
          justify-content: center;
        }
        .loading-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
          color: rgba(255,255,255,0.5);
          font-size: 13px;
        }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.15);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: rgba(255,255,255,0.2);
          font-size: 12px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .divider span { white-space: nowrap; }

        .bot-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px;
          background: rgba(37, 99, 235, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.25);
          border-radius: 14px;
          color: #60a5fa;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          margin-bottom: 20px;
        }
        .bot-link:hover {
          background: rgba(37, 99, 235, 0.25);
          transform: translateY(-1px);
        }

        .login-footer {
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          line-height: 1.5;
        }
        .login-footer strong { color: rgba(255,255,255,0.5); }

        @media (max-width: 400px) {
          .login-card { padding: 32px 20px; }
          .code-input { width: 42px; height: 52px; font-size: 20px; }
        }
      `}</style>
    </div>
  )
}
