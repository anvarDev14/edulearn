import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crown, Check, Upload, Copy, ExternalLink, AlertCircle } from 'lucide-react'
import { paymentAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Loader from '../components/common/Loader'

export default function Premium() {
  const { user } = useAuth()
  const { t, isDark } = useTheme()
  const [plans, setPlans] = useState([])
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [screenshot, setScreenshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  const cardClass = isDark ? 'bg-slate-800' : 'bg-white shadow-sm'
  const textClass = isDark ? 'text-white' : 'text-slate-800'
  const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500'
  const inputClass = isDark ? 'bg-slate-700' : 'bg-slate-100'

  useEffect(() => {
    loadData()
  }, [])

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
    } catch (error) {
      console.error('Error:', error)
      setError(t('errors.network'))
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
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Max 10MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('Images only')
        return
      }
      setScreenshot(file)
    }
  }

  const submitPayment = async () => {
    if (!screenshot || !paymentInfo || submitting) return
    setSubmitting(true)

    try {
      const uploadRes = await paymentAPI.uploadScreenshot(screenshot)
      if (!uploadRes.data?.url) throw new Error('Upload failed')
      await paymentAPI.createRequest(selectedPlan, uploadRes.data.url)
      alert(t('premium.pending'))
      setScreenshot(null)
      loadData()
    } catch (error) {
      alert(error.response?.data?.detail || t('errors.server'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h1 className="text-xl font-bold mb-2 text-red-400">{t('error')}</h1>
          <p className={subTextClass + " mb-4"}>{error}</p>
          <button onClick={loadData} className={`${cardClass} px-6 py-2 rounded-xl ${textClass}`}>
            {t('errors.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  if (user?.is_premium) {
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className="bg-gradient-to-b from-amber-500 to-orange-600 rounded-2xl p-6 text-center text-white">
          <Crown size={48} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('premium.active')}</h1>
          <p className="opacity-90">
            {status?.days_remaining} {t('premium.daysLeft')}
          </p>
        </div>
        <div className="mt-6 space-y-3">
          {plans[0]?.features?.map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-green-500">
              <Check size={20} />
              <span className={textClass}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (status?.latest_payment?.status === 'pending') {
    return (
      <div className="min-h-screen p-4 pb-24">
        <div className={`${cardClass} rounded-2xl p-6 text-center`}>
          <div className="text-6xl mb-4">⏳</div>
          <h1 className={`text-xl font-bold mb-2 ${textClass}`}>{t('premium.pending')}</h1>
          <p className={subTextClass}>{t('premium.pendingDesc')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <h1 className={`text-2xl font-bold mb-6 ${textClass}`}>{t('premium.title')}</h1>

      {/* Plans */}
      <div className="space-y-4 mb-6">
        {plans.map(plan => (
          <motion.div
            key={plan.type}
            onClick={() => setSelectedPlan(plan.type)}
            className={`${cardClass} rounded-2xl p-4 cursor-pointer transition ${
              selectedPlan === plan.type ? 'ring-2 ring-amber-500' : ''
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className={`font-bold text-lg ${textClass}`}>{plan.name}</h3>
                <p className={`text-sm ${subTextClass}`}>{plan.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-500">{plan.price_formatted}</p>
                {plan.discount && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    -{plan.discount}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {plan.features?.map((f, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm ${subTextClass}`}>
                  <Check size={16} className="text-green-500" />
                  {f}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payment Info */}
      {paymentInfo ? (
        <div className={`${cardClass} rounded-2xl p-4 mb-6`}>
          <h3 className={`font-bold mb-4 ${textClass}`}>{t('premium.payment')}</h3>
          <div className="space-y-3">
            <div className={`flex items-center justify-between ${inputClass} rounded-xl p-3`}>
              <div>
                <p className={`text-sm ${subTextClass}`}>{t('premium.cardNumber')}</p>
                <p className={`font-mono font-bold ${textClass}`}>{paymentInfo.card_number || '-'}</p>
              </div>
              <button onClick={copyCard} className="p-2">
                {copied ? <Check className="text-green-500" size={20} /> : <Copy size={20} className={subTextClass} />}
              </button>
            </div>
            <div className={`${inputClass} rounded-xl p-3`}>
              <p className={`text-sm ${subTextClass}`}>{t('premium.cardHolder')}</p>
              <p className={`font-bold ${textClass}`}>{paymentInfo.card_holder || '-'}</p>
            </div>
            {paymentInfo.admin_username && (
              <div className={`flex items-center justify-between ${inputClass} rounded-xl p-3`}>
                <div>
                  <p className={`text-sm ${subTextClass}`}>{t('premium.admin')}</p>
                  <p className={`font-bold ${textClass}`}>{paymentInfo.admin_username}</p>
                </div>
                <a
                  href={`https://t.me/${paymentInfo.admin_username.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2"
                >
                  <ExternalLink size={20} className={subTextClass} />
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-400" />
            <p className="text-yellow-400 text-sm">{t('errors.network')}</p>
          </div>
        </div>
      )}

      {/* Upload */}
      <div className={`${cardClass} rounded-2xl p-4 mb-6`}>
        <h3 className={`font-bold mb-4 ${textClass}`}>{t('premium.uploadCheck')}</h3>
        <label className="block">
          <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
            screenshot ? 'border-green-500 bg-green-500/10' : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-slate-300 hover:border-slate-400'
          }`}>
            <Upload size={32} className={`mx-auto mb-2 ${screenshot ? 'text-green-400' : subTextClass}`} />
            {screenshot ? (
              <div>
                <p className="text-green-500 font-medium">{screenshot.name}</p>
                <p className={`text-sm mt-1 ${subTextClass}`}>{(screenshot.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className={subTextClass}>{t('premium.uploadImage')}</p>
                <p className={`text-sm mt-1 ${subTextClass}`}>JPG, PNG (max 10MB)</p>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </div>

      {/* Submit */}
      <motion.button
        onClick={submitPayment}
        disabled={!screenshot || !paymentInfo || submitting}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 py-4 rounded-xl font-bold text-white disabled:opacity-50"
        whileHover={!submitting && screenshot ? { scale: 1.02 } : {}}
        whileTap={!submitting && screenshot ? { scale: 0.98 } : {}}
      >
        {submitting ? t('loading') : t('premium.submit')}
      </motion.button>
    </div>
  )
}
