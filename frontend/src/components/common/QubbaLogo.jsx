export default function QubbaLogo({ size = 120, pulse = false }) {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={pulse ? { animation: 'qubbaPulse 2.4s ease-in-out infinite' } : {}}
    >
      {/* Outer gold ring */}
      <circle cx="100" cy="100" r="99" fill="#C4A044" />

      {/* Teal background */}
      <circle cx="100" cy="100" r="90" fill="#15707F" />

      {/* Inner decorative ring */}
      <circle cx="100" cy="100" r="83" fill="none" stroke="#C4A044" strokeWidth="1.5" opacity="0.55" />

      {/* 8 ornamental petals around center */}
      {petals.map((angle) => {
        const rad = (angle * Math.PI) / 180
        const cx = 100 + 57 * Math.sin(rad)
        const cy = 100 - 57 * Math.cos(rad)
        return (
          <ellipse
            key={angle}
            cx={cx} cy={cy}
            rx="6.5" ry="14"
            transform={`rotate(${angle}, ${cx}, ${cy})`}
            fill="#C4A044"
            opacity="0.88"
          />
        )
      })}

      {/* Corner diamond accents (at 4 diagonal petal intersections) */}
      {[45, 135, 225, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180
        const cx = 100 + 57 * Math.sin(rad)
        const cy = 100 - 57 * Math.cos(rad)
        return (
          <circle key={`dot-${angle}`} cx={cx} cy={cy} r="4.5" fill="#C4A044" opacity="0.6" />
        )
      })}

      {/* 3-tier stepped base */}
      <rect x="55" y="120" width="90" height="5"  rx="1.5" fill="#C4A044" />
      <rect x="60" y="128" width="80" height="4.5" rx="1.5" fill="#C4A044" />
      <rect x="65" y="135" width="70" height="4"   rx="1.5" fill="#C4A044" />

      {/* Central dome arch body */}
      <path d="M75,120 L75,100 Q75,66 100,58 Q125,66 125,100 L125,120 Z" fill="#C4A044" />

      {/* Arch cutout (teal inside dome) */}
      <path d="M83,119 L83,101 Q83,73 100,66 Q117,73 117,101 L117,119 Z" fill="#15707F" />

      {/* V-chevron decoraton inside arch */}
      <path d="M90,92 L100,66 L110,92 L100,86 Z" fill="#C4A044" />

      {/* Dome spire stem */}
      <path d="M100,58 L97,52 L100,42 L103,52 Z" fill="#C4A044" />

      {/* Spire top bud */}
      <circle cx="100" cy="40" r="6" fill="#C4A044" />

      {/* Left wing leaf */}
      <path d="M73,100 Q56,103 59,116 Q67,104 78,107 L78,100 Z" fill="#C4A044" opacity="0.85" />

      {/* Right wing leaf */}
      <path d="M127,100 Q144,103 141,116 Q133,104 122,107 L122,100 Z" fill="#C4A044" opacity="0.85" />
    </svg>
  )
}
