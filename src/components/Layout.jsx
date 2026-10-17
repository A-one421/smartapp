import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Home, Users, User } from 'lucide-react'

export function GreenBar({ title, subtitle, back = true, backTo, right }) {
  const nav = useNavigate()
  return (
    <header className="topbar-green">
      {back && <button className="icon-btn" onClick={() => (backTo ? nav(backTo) : nav(-1))} aria-label="Go back"><ArrowLeft size={26} /></button>}
      <div style={{ flex: 1 }}>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}

export function BottomNav() {
  const { pathname } = useLocation()
  const homeActive = pathname === '/' || pathname.startsWith('/jamb')
  return (
    <nav className="bottom-nav" aria-label="Main">
      <NavLink to="/" className={homeActive ? 'active' : ''}><Home size={22} /><span>Home</span></NavLink>
      <NavLink to="/forum" className={({ isActive }) => (isActive ? 'active' : '')}><Users size={22} /><span>Forum</span></NavLink>
      <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}><User size={22} /><span>Profile</span></NavLink>
    </nav>
  )
}
