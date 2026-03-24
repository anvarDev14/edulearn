import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, BookOpen, Search, Swords, User } from 'lucide-react'

const NAV = [
  { to: '/', icon: Home, label: 'Bosh' },
  { to: '/modules', icon: BookOpen, label: 'Kurslar' },
  { to: '/search', icon: Search, label: 'Qidiruv' },
  { to: '/battle', icon: Swords, label: 'Jang' },
  { to: '/profile', icon: User, label: 'Profil' },
]

export default function BottomNav() {
  const { user } = useAuth()
  const location = useLocation()

  const hideOn = ['/login', '/quiz/', '/battle/']
  if (!user) return null
  if (hideOn.some(p => location.pathname.startsWith(p))) return null

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'var(--nav-h)',
      background: 'rgba(253,250,246,0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 100,
    }}>
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, padding: '6px 16px', borderRadius: 12,
            cursor: 'pointer', minWidth: 52, textDecoration: 'none',
            transition: 'all 0.18s',
            background: isActive ? 'var(--primary-dim)' : 'transparent',
            color: isActive ? 'var(--primary)' : 'var(--text3)',
          })}
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: '0.2px' }}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
