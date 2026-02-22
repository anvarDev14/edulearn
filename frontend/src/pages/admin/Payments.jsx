import { useState, useEffect } from 'react'
import { Check, X, ExternalLink } from 'lucide-react'
import { adminAPI } from '../../api'
import Loader from '../../components/common/Loader'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadPayments()
  }, [])
  
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
      alert('Xatolik')
    }
  }
  
  if (loading) return <Loader />
  
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">💳 Kutayotgan to'lovlar</h1>
      
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-6xl mb-4">✅</p>
          <p className="text-slate-400">Kutayotgan to'lovlar yo'q</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map(payment => (
            <div key={payment.id} className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold">{payment.user?.full_name}</p>
                  <p className="text-slate-400 text-sm">@{payment.user?.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-400">
                    {payment.amount.toLocaleString()} so'm
                  </p>
                  <p className="text-slate-400 text-sm">{payment.plan_type}</p>
                </div>
              </div>
              
              {/* Screenshot */}
              <a 
                href={payment.screenshot_url}
                target="_blank"
                className="block bg-slate-700 rounded-xl p-3 mb-3 flex items-center justify-center gap-2 text-blue-400"
              >
                <ExternalLink size={18} />
                Chekni ko'rish
              </a>
              
              <p className="text-slate-400 text-xs mb-3">
                {new Date(payment.created_at).toLocaleString()}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => reviewPayment(payment.id, false)}
                  className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Rad etish
                </button>
                <button
                  onClick={() => reviewPayment(payment.id, true)}
                  className="flex-1 py-3 bg-green-500 rounded-xl flex items-center justify-center gap-2 font-bold"
                >
                  <Check size={20} />
                  Tasdiqlash
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
