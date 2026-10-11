import { NavLink, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, Users, User } from 'lucide-react'

export function GreenBar({ title, subtitle, back = true, right }) {
  const nav = useNavigate()
  return (
    <header className="topbar-green">
      {back && <button className="icon-btn" onClick={() => nav(-1)} aria-label="Go back"><ArrowLeft size={26} /></button>}
      <div style={{ flex: 1 }}>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}

export function BottomNav() {
  const item = (to, Icon, label, end) => (
    <NavLink to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
      <Icon size={26} /> <span>{label}</span>
    </NavLink>
  )
  return (
    <nav className="bottom-nav" aria-label="Main">
      {item('/', Home, 'JAMB/UTME', true)}
      {item('/forum', Users, 'Forum')}
      {item('/profile', User, 'Profile')}
    </nav>
  )
}
