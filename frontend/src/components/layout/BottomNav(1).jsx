import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/', icon: '🏠', label: 'Bosh' },
  { to: '/modules', icon: '📚', label: 'Kurslar' },
  { to: '/search', icon: '🔍', label: 'Qidiruv' },
  { to: '/challenges', icon: '🏅', label: 'Topshiriq' },
  { to: '/profile', icon: '👤', label: 'Profil' },
]

export default function BottomNav() {
  const { user } = useAuth()
  const location = useLocation()

  const hideOn = ['/login', '/quiz/']
  if (!user) return null
  if (hideOn.some(p => location.pathname.startsWith(p))) return null

  return (
    <nav className="bottom-nav">
      {NAV.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
          <span className="nav-dot" />
        </NavLink>
      ))}
    </nav>
  )
}
