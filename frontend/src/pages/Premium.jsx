import { useState, useEffect } from 'react'
import { Crown, Check, Upload, Copy, ExternalLink, AlertCircle, ChevronRight } from 'lucide-react'
import { paymentAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/common/Loader'

export default function Premium() {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [screenshot, setScreenshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setError(null)
      const [plansRes, statusRes] = await Promise.all([
        paymentAPI.getPlans(),
        paymentAPI.getStatus()
      ])
      setPlans(plansRes.data.plans || [])
      setPaymentInfo(plansRes.data.payment_info || null)
      setStatus(statusRes.data)
    } catch (err) {
      setError("Ma'lumot yuklanmadi")
    } finally {
      setLoading(false)
    }
  }

  const copyCard = () => {
    if (!paymentInfo?.card_number) return
    navigator.clipboard.writeText(paymentInfo.card_number.replace(/\s/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('Max 10MB'); return }
    if (!file.type.startsWith('image/')) { alert('Faqat rasm'); return }
    setScreenshot(file)
  }

  const submitPayment = async () => {
    if (!screenshot || !paymentInfo || submitting) return
    setSubmitting(true)
    try {
      const uploadRes = await paymentAPI.uploadScreenshot(screenshot)
      if (!uploadRes.data?.url) throw new Error('Upload failed')
      await paymentAPI.createRequest(selectedPlan, uploadRes.data.url)
      alert("To'lov yuborildi! Tez orada tekshiriladi.")
      setScreenshot(null)
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || "Xatolik yuz berdi")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <AlertCircle size={40} style={{ color: 'var(--red)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--red)', fontWeight: 600, marginBottom: 8 }}>Xatolik</p>
          <p style={{ color: 'var(--text3)', marginBottom: 16, fontSize: 13 }}>{error}</p>
          <button onClick={loadData} className="btn btn-secondary">Qayta urinish</button>
        </div>
      </div>
    )
  }

  if (user?.is_premium) {
    return (
      <div className="page">
        <div className="card card-lg" style={{
          background: 'linear-gradient(135deg, rgba(184,115,51,0.12), rgba(196,149,106,0.08))',
          borderColor: 'rgba(184,115,51,0.2)', textAlign: 'center', marginBottom: 20
        }}>
          <Crown size={40} style={{ color: 'var(--gold)', margin: '0 auto 12px' }} />
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: 'var(--text)' }}>Premium faol</h1>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>{status?.days_remaining} kun qoldi</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {plans[0]?.features?.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text2)' }}>
              <Check size={16} style={{ color: 'var(--green)', flexShrink: 0 }} /> {f}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (status?.latest_payment?.status === 'pending') {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>Tekshirilmoqda</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>To'lovingiz tekshirilmoqda. Tez orada natija bildiriladi.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <Crown size={26} style={{ color: 'var(--gold)' }} />
        <div>
          <h1 className="page-title">Premium</h1>
          <p className="page-subtitle">Barcha imkoniyatlarni oching</p>
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {plans.map(plan => (
          <button
            key={plan.type}
            type="button"
            onClick={() => setSelectedPlan(plan.type)}
            className="card"
            style={{
              textAlign: 'left', cursor: 'pointer', width: '100%',
              borderColor: selectedPlan === plan.type ? 'var(--gold)' : 'var(--border)',
              background: selectedPlan === plan.type ? 'rgba(184,115,51,0.07)' : 'var(--surface)',
              transition: 'all 0.18s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{plan.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>{plan.duration}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--gold)' }}>{plan.price_formatted}</p>
                {plan.discount && (
                  <span className="badge badge-green" style={{ fontSize: 10 }}>-{plan.discount}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {plan.features?.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text3)' }}>
                  <Check size={13} style={{ color: 'var(--green)', flexShrink: 0 }} /> {f}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Payment info */}
      {paymentInfo ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--text)' }}>💳 To'lov ma'lumotlari</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Karta raqami</p>
                <p style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{paymentInfo.card_number || '-'}</p>
              </div>
              <button onClick={copyCard} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                {copied ? <Check size={18} style={{ color: 'var(--green)' }} /> : <Copy size={18} style={{ color: 'var(--text3)' }} />}
              </button>
            </div>
            <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Karta egasi</p>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{paymentInfo.card_holder || '-'}</p>
            </div>
            {paymentInfo.admin_username && (
              <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Admin</p>
                  <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{paymentInfo.admin_username}</p>
                </div>
                <a
                  href={`https://t.me/${paymentInfo.admin_username.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: 6 }}
                >
                  <ExternalLink size={18} style={{ color: 'var(--text3)' }} />
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(184,115,51,0.2)', background: 'var(--gold-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} style={{ color: 'var(--gold)' }} />
            <p style={{ color: 'var(--gold)', fontSize: 13 }}>To'lov ma'lumotlari yuklanmadi</p>
          </div>
        </div>
      )}

      {/* Upload */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--text)' }}>📸 Chekni yuklang</p>
        <label style={{ display: 'block', cursor: 'pointer' }}>
          <div style={{
            border: `2px dashed ${screenshot ? 'var(--green)' : 'var(--border2)'}`,
            borderRadius: 12, padding: '24px 16px', textAlign: 'center',
            background: screenshot ? 'var(--green-dim)' : 'var(--bg2)',
            transition: 'all 0.18s',
          }}>
            <Upload size={28} style={{ color: screenshot ? 'var(--green)' : 'var(--text3)', margin: '0 auto 8px', display: 'block' }} />
            {screenshot ? (
              <>
                <p style={{ color: 'var(--green)', fontWeight: 600, fontSize: 13 }}>{screenshot.name}</p>
                <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 3 }}>{(screenshot.size / 1024).toFixed(1)} KB</p>
              </>
            ) : (
              <>
                <p style={{ color: 'var(--text3)', fontSize: 13 }}>Rasm yuklash uchun bosing</p>
                <p style={{ color: 'var(--text3)', fontSize: 11, marginTop: 3 }}>JPG, PNG (max 10MB)</p>
              </>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Submit */}
      <button
        onClick={submitPayment}
        disabled={!screenshot || !paymentInfo || submitting}
        className="btn btn-full btn-lg"
        style={{ background: 'linear-gradient(135deg, var(--gold), var(--accent))', color: 'white', fontWeight: 700 }}
      >
        {submitting ? 'Yuklanmoqda...' : "To'lovni yuborish"}
      </button>
    </div>
  )
}
