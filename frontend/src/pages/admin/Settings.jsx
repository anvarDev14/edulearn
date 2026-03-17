import { useState } from 'react'
import { Settings as SettingsIcon, CreditCard, Bell, Database, Shield, Save, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminSettings() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    // Payment settings
    card_number: '8600 1234 5678 9012',
    card_holder: 'EDULEARN',
    admin_username: '@edulearn_admin',
    monthly_price: 50000,
    yearly_price: 500000,

    // Notification settings
    notify_payments: true,
    notify_new_users: true,
    notify_quiz_completed: false,

    // System settings
    maintenance_mode: false,
    allow_registration: true
  })

  const handleSave = () => {
    // In real app, save to backend
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!user?.is_admin) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-xl">Ruxsat yo'q</p>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <SettingsIcon size={24} />
        Sozlamalar
      </h1>

      {/* Payment Settings */}
      <div className="bg-slate-800 rounded-2xl p-5 mb-4">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CreditCard size={20} className="text-green-400" />
          To'lov sozlamalari
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm block mb-2">Karta raqami</label>
            <input
              type="text"
              value={settings.card_number}
              onChange={e => setSettings({ ...settings, card_number: e.target.value })}
              className="w-full bg-slate-700 rounded-xl p-3 text-white font-mono"
              placeholder="8600 1234 5678 9012"
            />
          </div>

          <div>
            <label className="text-slate-400 text-sm block mb-2">Karta egasi</label>
            <input
              type="text"
              value={settings.card_holder}
              onChange={e => setSettings({ ...settings, card_holder: e.target.value })}
              className="w-full bg-slate-700 rounded-xl p-3 text-white"
              placeholder="EDULEARN"
            />
          </div>

          <div>
            <label className="text-slate-400 text-sm block mb-2">Admin username (Telegram)</label>
            <input
              type="text"
              value={settings.admin_username}
              onChange={e => setSettings({ ...settings, admin_username: e.target.value })}
              className="w-full bg-slate-700 rounded-xl p-3 text-white"
              placeholder="@edulearn_admin"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-sm block mb-2">Oylik narx (so'm)</label>
              <input
                type="number"
                value={settings.monthly_price}
                onChange={e => setSettings({ ...settings, monthly_price: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-700 rounded-xl p-3 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm block mb-2">Yillik narx (so'm)</label>
              <input
                type="number"
                value={settings.yearly_price}
                onChange={e => setSettings({ ...settings, yearly_price: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-700 rounded-xl p-3 text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-slate-800 rounded-2xl p-5 mb-4">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Bell size={20} className="text-yellow-400" />
          Bildirishnomalar
        </h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4 cursor-pointer">
            <span className="text-white">Yangi to'lovlar</span>
            <input
              type="checkbox"
              checked={settings.notify_payments}
              onChange={e => setSettings({ ...settings, notify_payments: e.target.checked })}
              className="w-5 h-5 accent-green-500"
            />
          </label>

          <label className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4 cursor-pointer">
            <span className="text-white">Yangi foydalanuvchilar</span>
            <input
              type="checkbox"
              checked={settings.notify_new_users}
              onChange={e => setSettings({ ...settings, notify_new_users: e.target.checked })}
              className="w-5 h-5 accent-green-500"
            />
          </label>

          <label className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4 cursor-pointer">
            <span className="text-white">Quiz yakunlanganda</span>
            <input
              type="checkbox"
              checked={settings.notify_quiz_completed}
              onChange={e => setSettings({ ...settings, notify_quiz_completed: e.target.checked })}
              className="w-5 h-5 accent-green-500"
            />
          </label>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-slate-800 rounded-2xl p-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield size={20} className="text-blue-400" />
          Tizim sozlamalari
        </h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4 cursor-pointer">
            <div>
              <span className="text-white block">Texnik ishlar rejimi</span>
              <span className="text-slate-400 text-sm">Foydalanuvchilar kira olmaydi</span>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={e => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              className="w-5 h-5 accent-red-500"
            />
          </label>

          <label className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4 cursor-pointer">
            <div>
              <span className="text-white block">Ro'yxatdan o'tish</span>
              <span className="text-slate-400 text-sm">Yangi foydalanuvchilar qo'shilishi</span>
            </div>
            <input
              type="checkbox"
              checked={settings.allow_registration}
              onChange={e => setSettings({ ...settings, allow_registration: e.target.checked })}
              className="w-5 h-5 accent-green-500"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition ${
          saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'
        }`}
      >
        {saved ? (
          <>
            <Check size={20} />
            Saqlandi!
          </>
        ) : (
          <>
            <Save size={20} />
            Saqlash
          </>
        )}
      </button>
    </div>
  )
}
