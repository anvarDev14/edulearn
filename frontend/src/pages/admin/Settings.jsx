import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CreditCard, Bell, Shield, Save, Check,
  ChevronLeft, Settings as SettingsIcon
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminSettings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    card_number: '8600 1234 5678 9012',
    card_holder: 'EDULEARN',
    admin_username: '@edulearn_admin',
    monthly_price: 50000,
    yearly_price: 500000,
    notify_payments: true,
    notify_new_users: true,
    notify_quiz_completed: false,
    maintenance_mode: false,
    allow_registration: true,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!user?.is_admin) return (
    <div className="page" style={{ textAlign: 'center' }}>
      <p style={{ color: 'var(--red)', fontSize: 18 }}>🚫 Ruxsat yo'q</p>
    </div>
  )

  /* ── helpers ── */
  const inp = {
    width: '100%', padding: '10px 12px',
    background: 'var(--bg2)', border: '1.5px solid var(--border)',
    borderRadius: 10, color: 'var(--text)', fontSize: 14,
    outline: 'none', fontFamily: 'var(--font)',
    transition: 'border-color 0.18s',
  }

  const SectionLabel = ({ icon, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      {icon}
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{children}</p>
    </div>
  )

  const Toggle = ({ value, onChange }) => (
    <div
      onClick={onChange}
      style={{
        width: 46, height: 26, borderRadius: 13, flexShrink: 0,
        background: value ? 'var(--primary)' : 'var(--border2)',
        position: 'relative', transition: 'background 0.22s', cursor: 'pointer',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: value ? 23 : 3,
        width: 20, height: 20, borderRadius: '50%', background: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        transition: 'left 0.22s cubic-bezier(.22,.68,0,1.2)',
      }} />
    </div>
  )

  const ToggleRow = ({ label, sub, value, onChange }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '12px 0',
    }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: sub ? 2 : 0 }}>{label}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--text3)' }}>{sub}</p>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  )

  const sep = <div style={{ height: 1, background: 'var(--border)' }} />

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <button
          onClick={() => navigate('/admin')}
          style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 10, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <ChevronLeft size={18} style={{ color: 'var(--text)' }} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Sozlamalar</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>Platforma konfiguratsiyasi</p>
        </div>
      </div>

      {/* Payment settings */}
      <div className="card" style={{ marginBottom: 12 }}>
        <SectionLabel icon={<CreditCard size={17} style={{ color: 'var(--green)' }} />}>
          To'lov sozlamalari
        </SectionLabel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="input-label">Karta raqami</label>
            <input
              style={{ ...inp, fontFamily: 'var(--mono)' }}
              placeholder="8600 1234 5678 9012"
              value={settings.card_number}
              onChange={e => setSettings({ ...settings, card_number: e.target.value })}
            />
          </div>

          <div>
            <label className="input-label">Karta egasi</label>
            <input
              style={inp}
              placeholder="EDULEARN"
              value={settings.card_holder}
              onChange={e => setSettings({ ...settings, card_holder: e.target.value })}
            />
          </div>

          <div>
            <label className="input-label">Admin Telegram username</label>
            <input
              style={inp}
              placeholder="@edulearn_admin"
              value={settings.admin_username}
              onChange={e => setSettings({ ...settings, admin_username: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="input-label">Oylik narx (so'm)</label>
              <input
                style={inp}
                type="number"
                value={settings.monthly_price}
                onChange={e => setSettings({ ...settings, monthly_price: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="input-label">Yillik narx (so'm)</label>
              <input
                style={inp}
                type="number"
                value={settings.yearly_price}
                onChange={e => setSettings({ ...settings, yearly_price: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card" style={{ marginBottom: 12 }}>
        <SectionLabel icon={<Bell size={17} style={{ color: 'var(--gold)' }} />}>
          Bildirishnomalar
        </SectionLabel>

        <ToggleRow
          label="Yangi to'lovlar"
          value={settings.notify_payments}
          onChange={() => setSettings(s => ({ ...s, notify_payments: !s.notify_payments }))}
        />
        {sep}
        <ToggleRow
          label="Yangi foydalanuvchilar"
          value={settings.notify_new_users}
          onChange={() => setSettings(s => ({ ...s, notify_new_users: !s.notify_new_users }))}
        />
        {sep}
        <ToggleRow
          label="Quiz yakunlanganda"
          value={settings.notify_quiz_completed}
          onChange={() => setSettings(s => ({ ...s, notify_quiz_completed: !s.notify_quiz_completed }))}
        />
      </div>

      {/* System */}
      <div className="card" style={{ marginBottom: 20 }}>
        <SectionLabel icon={<Shield size={17} style={{ color: 'var(--primary)' }} />}>
          Tizim sozlamalari
        </SectionLabel>

        <ToggleRow
          label="Texnik ishlar rejimi"
          sub="Yoqilsa foydalanuvchilar kira olmaydi"
          value={settings.maintenance_mode}
          onChange={() => setSettings(s => ({ ...s, maintenance_mode: !s.maintenance_mode }))}
        />
        {sep}
        <ToggleRow
          label="Ro'yxatdan o'tish"
          sub="Yangi foydalanuvchilar qo'shilishi"
          value={settings.allow_registration}
          onChange={() => setSettings(s => ({ ...s, allow_registration: !s.allow_registration }))}
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="btn btn-full btn-lg"
        style={{
          background: saved ? 'var(--green)' : 'var(--primary)',
          color: 'white',
          transition: 'background 0.2s',
        }}
      >
        {saved
          ? <><Check size={18} /> Saqlandi!</>
          : <><Save size={18} /> Saqlash</>
        }
      </button>
    </div>
  )
}
