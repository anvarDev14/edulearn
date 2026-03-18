import { useState, useEffect } from 'react'
import { Check, X, ExternalLink, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'

const getScreenshotUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || ''
  return `${base}/${url}`
}

export default function AdminPayments() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadPayments() }, [])

  const loadPayments = async () => {
    try {
      const res = await adminAPI.getPendingPayments()
      setPayments(res.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const reviewPayment = async (id, approved) => {
    const note = approved ? '' : prompt('Rad etish sababi:')
    if (!approved && note === null) return
    try {
      await adminAPI.reviewPayment(id, approved, note)
      loadPayments()
    } catch (error) {
      alert('Xatolik: ' + (error.response?.data?.detail || 'Server xatosi'))
    }
  }

  if (!user?.is_admin) return (
    <div className="page" style={{ textAlign: 'center' }}>
      <p style={{ color: 'var(--red)', fontSize: 18 }}>🚫 Ruxsat yo'q</p>
    </div>
  )

  if (loading) return <Loader />

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ChevronLeft size={18} style={{ color: 'var(--text)' }} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>💳 Kutilayotgan to'lovlar</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>{payments.length} ta so'rov</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">✅</span>
          <p className="empty-title">Kutilayotgan to'lovlar yo'q</p>
          <p className="empty-desc">Barcha to'lovlar ko'rib chiqilgan</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {payments.map(payment => (
            <div key={payment.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {payment.user?.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{payment.user?.full_name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text3)' }}>@{payment.user?.username}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)' }}>{payment.amount?.toLocaleString()} so'm</p>
                  <span className="badge badge-primary" style={{ fontSize: 10 }}>{payment.plan_type}</span>
                </div>
              </div>

              <a
                href={getScreenshotUrl(payment.screenshot_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="card card-sm"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginBottom: 12, color: 'var(--primary)', fontWeight: 600, fontSize: 13,
                  background: 'var(--primary-dim)', borderColor: 'rgba(123,79,58,0.15)',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={15} /> Chekni ko'rish
              </a>

              <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>
                {new Date(payment.created_at).toLocaleString('uz-UZ')}
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => reviewPayment(payment.id, false)}
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  <X size={16} /> Rad etish
                </button>
                <button
                  onClick={() => reviewPayment(payment.id, true)}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  <Check size={16} /> Tasdiqlash
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
