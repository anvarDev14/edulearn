export default function Loader({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="loader-full">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16, animation: 'bounce 1.5s ease-in-out infinite' }}>🎓</div>
          <div className="spinner" style={{ margin: '0 auto', width: 28, height: 28 }} />
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text3)' }}>Yuklanmoqda...</p>
        </div>
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <div className="spinner" />
    </div>
  )
}
