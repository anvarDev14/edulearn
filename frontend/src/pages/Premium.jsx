import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crown, Check, Upload, Copy, ExternalLink } from 'lucide-react'
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
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const [plansRes, statusRes] = await Promise.all([
        paymentAPI.getPlans(),
        paymentAPI.getStatus()
      ])
      setPlans(plansRes.data.plans)
      setPaymentInfo(plansRes.data.payment_info)
      setStatus(statusRes.data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const copyCard = () => {
    navigator.clipboard.writeText(paymentInfo.card_number.replace(/\s/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setScreenshot(file)
    }
  }
  
  const submitPayment = async () => {
    if (!screenshot || submitting) return
    setSubmitting(true)
    
    try {
      // Upload screenshot
      const uploadRes = await paymentAPI.uploadScreenshot(screenshot)
      
      // Create payment request
      await paymentAPI.createRequest(selectedPlan, uploadRes.data.url)
      
      alert("To'lov so'rovi yuborildi! Tez orada tekshiriladi.")
      loadData()
    } catch (error) {
      alert(error.response?.data?.detail || 'Xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }
  
  if (loading) return <Loader />
  
  // Already premium
  if (user?.is_premium) {
    return (
      <div className="min-h-screen p-4">
        <div className="bg-gradient-to-b from-amber-500 to-orange-600 rounded-2xl p-6 text-center">
          <Crown size={48} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Premium Aktiv!</h1>
          <p className="opacity-90">
            {status?.premium_until && `${status.days_remaining} kun qoldi`}
          </p>
        </div>
        
        <div className="mt-6 space-y-3">
          {plans[0]?.features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-green-400">
              <Check size={20} />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  // Pending payment
  if (status?.latest_payment?.status === 'pending') {
    return (
      <div className="min-h-screen p-4">
        <div className="bg-slate-800 rounded-2xl p-6 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-xl font-bold mb-2">To'lov tekshirilmoqda</h1>
          <p className="text-slate-400">
            Sizning to'lovingiz ko'rib chiqilmoqda. Tez orada natija bildiriladi.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">👑 Premium</h1>
      
      {/* Plans */}
      <div className="space-y-4 mb-6">
        {plans.map(plan => (
          <motion.div
            key={plan.type}
            onClick={() => setSelectedPlan(plan.type)}
            className={`bg-slate-800 rounded-2xl p-4 cursor-pointer transition ${
              selectedPlan === plan.type ? 'ring-2 ring-amber-500' : ''
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <p className="text-slate-400 text-sm">{plan.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-500">{plan.price_formatted}</p>
                {plan.discount && (
                  <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full">
                    -{plan.discount}
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              {plan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <Check size={16} className="text-green-500" />
                  {f}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Payment Info */}
      <div className="bg-slate-800 rounded-2xl p-4 mb-6">
        <h3 className="font-bold mb-4">💳 To'lov ma'lumotlari</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-700 rounded-xl p-3">
            <div>
              <p className="text-slate-400 text-sm">Karta raqami</p>
              <p className="font-mono font-bold">{paymentInfo?.card_number}</p>
            </div>
            <button onClick={copyCard} className="p-2">
              {copied ? <Check className="text-green-500" /> : <Copy />}
            </button>
          </div>
          
          <div className="bg-slate-700 rounded-xl p-3">
            <p className="text-slate-400 text-sm">Karta egasi</p>
            <p className="font-bold">{paymentInfo?.card_holder}</p>
          </div>
          
          <div className="flex items-center justify-between bg-slate-700 rounded-xl p-3">
            <div>
              <p className="text-slate-400 text-sm">Admin</p>
              <p className="font-bold">{paymentInfo?.admin_username}</p>
            </div>
            <a 
              href={`https://t.me/${paymentInfo?.admin_username.replace('@', '')}`}
              target="_blank"
              className="p-2"
            >
              <ExternalLink size={20} />
            </a>
          </div>
        </div>
      </div>
      
      {/* Upload Screenshot */}
      <div className="bg-slate-800 rounded-2xl p-4 mb-6">
        <h3 className="font-bold mb-4">📸 Chek yuklash</h3>
        
        <label className="block">
          <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-slate-500 transition">
            <Upload size={32} className="mx-auto mb-2 text-slate-400" />
            {screenshot ? (
              <p className="text-green-400">{screenshot.name}</p>
            ) : (
              <p className="text-slate-400">Chek rasmini yuklang</p>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
      
      {/* Submit */}
      <motion.button
        onClick={submitPayment}
        disabled={!screenshot || submitting}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 py-4 rounded-xl font-bold disabled:opacity-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {submitting ? 'Yuborilmoqda...' : "To'lovni yuborish"}
      </motion.button>
    </div>
  )
}
