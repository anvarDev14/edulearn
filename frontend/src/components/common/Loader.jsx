import QubbaLogo from './QubbaLogo'

export default function Loader({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="loader-full">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <QubbaLogo size={130} pulse />

          <p style={{
            marginTop: 20,
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: 6,
            color: '#C4A044',
            fontFamily: 'Georgia, serif',
          }}>
            QUBBA
          </p>
          <p style={{
            fontSize: 10,
            letterSpacing: 3,
            color: 'var(--text3)',
            marginTop: 4,
            textTransform: 'uppercase',
          }}>
            An'anaviy Meros Loyihasi
          </p>

          {/* Loading dots */}
          <div style={{ display: 'flex', gap: 6, marginTop: 28 }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#C4A044',
                  opacity: 0.7,
                  animation: `qDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes qubbaPulse {
            0%, 100% { transform: scale(1);   opacity: 1;    }
            50%       { transform: scale(1.05); opacity: 0.88; }
          }
          @keyframes qDot {
            0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
            40%           { transform: scale(1.2); opacity: 1;   }
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
