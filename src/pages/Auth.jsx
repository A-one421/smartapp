import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { isConfigured } from '../lib/supabase'
import InstallBanner from '../components/InstallBanner'
import { APP_NAME } from '../config'

export default function Auth() {
  const { signIn, signUp, google, resetPassword } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setInfo(''); setBusy(true)
    try {
      if (mode === 'signup') {
        if (name.trim().length < 2) throw new Error('Enter your name.')
        const { data, error } = await signUp(name.trim(), email.trim(), password)
        if (error) throw error
        if (!data.session) setInfo('Account created. Check your email to confirm it, then log in.')
      } else {
        const { error } = await signIn(email.trim(), password)
        if (error) throw error
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally { setBusy(false) }
  }

  const forgot = async () => {
    if (!email) return setError('Enter your email first, then tap Forgot password.')
    const { error } = await resetPassword(email.trim())
    if (error) setError(error.message); else { setError(''); setInfo('Password reset link sent. Check your email.') }
  }

  return (
    <div className="auth">
      <img className="logo" src="/logo.png" alt={APP_NAME} />
      <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
      <p className="lead">{mode === 'login' ? 'Log in to continue practising.' : 'Start practising JAMB questions today.'}</p>
      <InstallBanner />
      {!isConfigured && <div className="err">Supabase is not set up yet. Copy .env.example to .env and add your keys.</div>}
      {error && <div className="err" role="alert">{error}</div>}
      {info && <div className="ok">{info}</div>}
      <form onSubmit={submit}>
        {mode === 'signup' && <input className="input" placeholder="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />}
        <input className="input" type="email" placeholder="Email address" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password (6+ characters)" minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
      </form>
      {mode === 'login' && <div className="center"><button className="link" onClick={forgot}>Forgot password?</button></div>}
      <div className="divider">or</div>
      <button className="btn ghost" onClick={google}>Continue with Google</button>
      <div className="center" style={{ marginTop: 18 }}>
        {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
        <button className="link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setInfo('') }}>
          {mode === 'login' ? 'Create account' : 'Log in'}
        </button>
      </div>
    </div>
  )
}
