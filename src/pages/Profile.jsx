import { useNavigate } from 'react-router-dom'
import { LogOut, Download, Crown, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { isLifetime } from '../config'

export default function Profile() {
  const nav = useNavigate()
  const { user, profile, hasFullAccess, signOut } = useAuth()
  const { canInstall, installed, install } = useInstallPrompt()
  const name = profile?.name || user?.email?.split('@')[0] || 'Student'
  const lifetime = profile?.role === 'admin' || isLifetime(profile?.access_expires_at)

  return (
    <main className="page has-nav">
      <div className="card center" style={{ marginTop: 'calc(12px + var(--safe-top))' }}>
        <div className="tile green" style={{ width: 76, height: 76, borderRadius: '50%', margin: '0 auto 10px', fontSize: 30, fontWeight: 700 }}>{name[0]?.toUpperCase()}</div>
        <h2 style={{ margin: '0 0 4px' }}>{name}</h2>
        <div style={{ color: 'var(--ink-2)', display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}><Mail size={15} /> {user?.email}</div>
      </div>

      <div className="card">
        <div className="card-title" style={{ fontSize: 18 }}><Crown color="var(--plum)" size={22} /> Plan
          <span className={`badge ${hasFullAccess ? 'paid' : 'free'}`}>{hasFullAccess ? 'Full access' : 'Free trial'}</span>
        </div>
        <p style={{ margin: '8px 0 14px', color: 'var(--ink-2)' }}>
          {hasFullAccess
            ? (lifetime ? 'Lifetime access. Log in on any phone and it is still yours.' : 'Active.')
            : 'Unlock every question, year and topic with one payment.'}
        </p>
        {!hasFullAccess && <button className="btn" onClick={() => nav('/activate')}>Unlock full access</button>}
      </div>

      {canInstall && !installed && (
        <button className="btn ghost" style={{ marginTop: 16 }} onClick={install}><Download size={18} /> Install app</button>
      )}
      <button className="btn ghost" style={{ marginTop: 16, color: 'var(--red)', borderColor: 'var(--red)' }} onClick={signOut}><LogOut size={18} /> Log out</button>
    </main>
  )
}
