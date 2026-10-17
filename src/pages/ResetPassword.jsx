import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { APP_NAME } from '../config'

// Shown after the student clicks the "reset password" link in their email.
export default function ResetPassword() {
  const { finishRecovery } = useAuth()
  const nav = useNavigate()
  const leave = () => { finishRecovery(); nav('/', { replace: true }) }
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (pw.length < 6) return setError('Use at least 6 characters.')
    if (pw !== pw2) return setError('The two passwords do not match.')
    setBusy(true)
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      setBusy(false)
      return setError('This link has expired. Go back and tap "Forgot password?" again to get a new one.')
    }
    const { error } = await supabase.auth.updateUser({ password: pw })
    setBusy(false)
    if (error) return setError(error.message)
    setDone(true)
  }

  return (
    <div className="auth">
      <img className="logo" src="/logo.png" alt={APP_NAME} />
      <h1>{done ? 'Password changed' : 'Set a new password'}</h1>
      <p className="lead">{done ? 'You can now continue with your new password.' : 'Choose a password you will remember.'}</p>
      {error && <div className="err" role="alert">{error}</div>}
      {done ? (
        <button className="btn" onClick={leave}>Continue</button>
      ) : (
        <form onSubmit={submit}>
          <input className="input" type="password" placeholder="New password" autoComplete="new-password" minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} required />
          <input className="input" type="password" placeholder="Repeat new password" autoComplete="new-password" minLength={6} value={pw2} onChange={(e) => setPw2(e.target.value)} required />
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
          <div className="center" style={{ marginTop: 14 }}>
            <button type="button" className="link" onClick={async () => { await supabase.auth.signOut(); leave() }}>Back to login</button>
          </div>
        </form>
      )}
    </div>
  )
}
