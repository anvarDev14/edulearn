import { useState, useEffect } from 'react'
import { certificatesAPI } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Certificates() {
  const { user } = useAuth()
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    certificatesAPI.getMy()
      .then(r => setCerts(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loader-full"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📜 Sertifikatlar</h1>
        <span className="badge badge-gold">{certs.length}</span>
      </div>

      {certs.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">📜</span>
          <p className="empty-title">Sertifikat yo'q</p>
          <p className="empty-desc">Kursni tugatganingizdan so'ng sertifikat olasiz</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {certs.map(cert => (
            <div
              key={cert.id}
              className="card"
              style={{ cursor: 'pointer', background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(99,102,241,0.06))', borderColor: 'rgba(245,158,11,0.2)' }}
              onClick={() => setSelected(cert)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 44 }}>{cert.module?.icon || '🎓'}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{cert.module?.title || 'Kurs'}</p>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="badge badge-gold">⭐ {cert.score?.toFixed(0) || 0}%</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {new Date(cert.issued_at).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                </div>
                <span style={{ color: 'var(--gold)', fontSize: 20 }}>→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            {/* Certificate design */}
            <div style={{
              background: 'linear-gradient(135deg, #0f0f2e, #1a1a3e)',
              border: '2px solid rgba(245,158,11,0.4)',
              borderRadius: 20,
              padding: '32px 24px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: 20
            }}>
              {/* Decorative corners */}
              {['top-left','top-right','bottom-left','bottom-right'].map(pos => (
                <div key={pos} style={{
                  position: 'absolute',
                  [pos.includes('top') ? 'top' : 'bottom']: 12,
                  [pos.includes('left') ? 'left' : 'right']: 12,
                  width: 24, height: 24,
                  borderTop: pos.includes('top') ? '2px solid rgba(245,158,11,0.5)' : 'none',
                  borderBottom: pos.includes('bottom') ? '2px solid rgba(245,158,11,0.5)' : 'none',
                  borderLeft: pos.includes('left') ? '2px solid rgba(245,158,11,0.5)' : 'none',
                  borderRight: pos.includes('right') ? '2px solid rgba(245,158,11,0.5)' : 'none',
                }} />
              ))}

              <div style={{ fontSize: 16, color: 'rgba(245,158,11,0.7)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Sertifikat</div>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{selected.module?.icon || '🎓'}</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Bu sertifikat</p>
              <p style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.3px' }}>{user?.full_name}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>tomonidan</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b', marginBottom: 16 }}>"{selected.module?.title}"</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>kursi muvaffaqiyatli tugatilganligi tasdiqlaydi</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
                <span className="badge badge-gold">⭐ {selected.score?.toFixed(0) || 0}% Ball</span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--mono)' }}>#{selected.certificate_code}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                {new Date(selected.issued_at).toLocaleDateString('uz-UZ', { year:'numeric', month:'long', day:'numeric' })}
              </p>
            </div>
            <button className="btn btn-secondary btn-full" onClick={() => setSelected(null)}>Yopish</button>
          </div>
        </div>
      )}
    </div>
  )
}
