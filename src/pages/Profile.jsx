import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, Download, LogOut, Pencil, KeyRound, ChevronRight, Timer, BookOpen, Trophy, Target, Layers, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { usePrice } from '../lib/price'
import { loadCombo } from '../lib/combo'
import SupportCard from '../components/SupportCard'
import { APP_NAME, TRACKS, isLifetime, naira } from '../config'

const when = (d) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })

export default function Profile() {
  const nav = useNavigate()
  const { user, profile, hasFullAccess, signOut, refreshProfile } = useAuth()
  const { canInstall, installed, install } = useInstallPrompt()
  const price = usePrice()
  const combo = useMemo(() => loadCombo('jamb'), [])
  const track = TRACKS.find((t) => t.id === combo?.track)

  const [sheet, setSheet] = useState(null) // 'name' | 'password' | 'logout'
  const [attempts, setAttempts] = useState({ rows: [], count: 0, loaded: false })

  const name = profile?.name || user?.email?.split('@')[0] || 'Student'
  const lifetime = profile?.role === 'admin' || isLifetime(profile?.access_expires_at)
  const since = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' }) : ''

  useEffect(() => {
    supabase.from('attempts').select('mode,total_score,total_questions,taken_at', { count: 'exact' })
      .order('taken_at', { ascending: false }).limit(30)
      .then(({ data, count }) => setAttempts({ rows: data || [], count: count || 0, loaded: true }))
  }, [])

  const pcts = attempts.rows.filter((r) => r.total_questions > 0).map((r) => Math.round((r.total_score / r.total_questions) * 100))
  const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null
  const best = pcts.length ? Math.max(...pcts) : null

  return (
    <main className="page has-nav hm pf">
      {/* Hero */}
      <section className="pf-hero">
        <div className="pf-avatar" aria-hidden="true">{name[0]?.toUpperCase()}</div>
        <h1>{name}</h1>
        <div className="pf-mail">{user?.email}</div>
        <div className="pf-tags">
          <span className={`pf-badge ${hasFullAccess ? 'paid' : 'free'}`}>{hasFullAccess ? <><Crown size={14} /> Full access</> : 'Free trial'}</span>
          {since && <span className="pf-since">Member since {since}</span>}
        </div>
      </section>

      {/* Progress */}
      <h3 className="hm-title">Your progress</h3>
      <div className="pf-stats">
        <div><Layers size={20} /><b>{attempts.count}</b><span>Sessions</span></div>
        <div><Target size={20} /><b>{avg === null ? '–' : avg + '%'}</b><span>Average</span></div>
        <div><Trophy size={20} /><b>{best === null ? '–' : best + '%'}</b><span>Best score</span></div>
      </div>

      {/* Plan */}
      <section className={`pf-card pf-plan ${hasFullAccess ? 'on' : ''}`}>
        <div className="pf-card-head">
          <span className="pf-ic"><Crown size={22} /></span>
          <div>
            <b>{hasFullAccess ? 'Full access is on' : 'You are on the free trial'}</b>
            <span>{hasFullAccess ? (lifetime ? 'Lifetime. Log in on any phone and it is still yours.' : 'Active.') : '10 questions per subject. Unlock everything with one payment.'}</span>
          </div>
        </div>
        {!hasFullAccess && <button className="btn" onClick={() => nav('/activate')}>Unlock full access, {naira(price)}</button>}
      </section>

      {/* Subjects */}
      <section className="pf-card">
        <div className="pf-card-head between">
          <b>JAMB subjects{track ? ` · ${track.label}` : ''}</b>
          <button className="link" onClick={() => nav('/jamb/setup')}>{combo ? 'Change' : 'Choose'}</button>
        </div>
        {combo ? (
          <div className="pf-chips"><span className="pf-chip lock">English</span>{combo.subjects.map((s) => <span key={s} className="pf-chip">{s}</span>)}</div>
        ) : (
          <p className="pf-muted">You have not chosen your subjects yet.</p>
        )}
      </section>

      {/* Recent practice */}
      <section className="pf-card">
        <div className="pf-card-head between"><b>Recent practice</b></div>
        {!attempts.loaded ? <p className="pf-muted">Loading…</p> : attempts.rows.length === 0 ? (
          <p className="pf-muted">Nothing yet. Finish a practice session and it will show here.</p>
        ) : attempts.rows.slice(0, 5).map((r, i) => {
          const pct = r.total_questions ? Math.round((r.total_score / r.total_questions) * 100) : 0
          return (
            <div className="pf-recent" key={i}>
              <span className={`pf-mode ${r.mode}`}>{r.mode === 'exam' ? <Timer size={18} /> : <BookOpen size={18} />}</span>
              <div><b>{r.mode === 'exam' ? 'Exam mode' : 'Study mode'}</b><span>{when(r.taken_at)} · {r.total_score}/{r.total_questions} correct</span></div>
              <em className={pct >= 50 ? 'good' : 'low'}>{pct}%</em>
            </div>
          )
        })}
      </section>

      <SupportCard />

      {/* Account */}
      <h3 className="hm-title">Account</h3>
      <section className="pf-list">
        <button className="pf-row" onClick={() => setSheet('name')}><Pencil size={20} /><span>Edit your name</span><ChevronRight size={20} /></button>
        <button className="pf-row" onClick={() => setSheet('password')}><KeyRound size={20} /><span>Change password</span><ChevronRight size={20} /></button>
        {canInstall && !installed && <button className="pf-row" onClick={install}><Download size={20} /><span>Install the app</span><ChevronRight size={20} /></button>}
        <button className="pf-row out" onClick={() => setSheet('logout')}><LogOut size={20} /><span>Log out</span></button>
      </section>
      <p className="pf-foot">{APP_NAME}</p>

      {sheet === 'name' && <NameSheet current={profile?.name || ''} userId={user.id} onDone={async () => { await refreshProfile(); setSheet(null) }} onClose={() => setSheet(null)} />}
      {sheet === 'password' && <PasswordSheet onClose={() => setSheet(null)} />}
      {sheet === 'logout' && (
        <div className="sheet-bg" onClick={() => setSheet(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 6px', fontSize: 20 }}>Log out?</h3>
            <p className="sub" style={{ margin: '0 0 16px' }}>Your progress and full access stay on your account.</p>
            <button className="btn danger" onClick={signOut}>Yes, log out</button>
            <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => setSheet(null)}>Stay logged in</button>
          </div>
        </div>
      )}
    </main>
  )
}

function NameSheet({ current, userId, onDone, onClose }) {
  const [v, setV] = useState(current)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const save = async (e) => {
    e.preventDefault()
    if (v.trim().length < 2) return setErr('Enter your name.')
    setBusy(true); setErr('')
    const { error } = await supabase.from('profiles').update({ name: v.trim() }).eq('id', userId)
    setBusy(false)
    if (error) return setErr(error.message)
    onDone()
  }
  return (
    <div className="sheet-bg" onClick={onClose}>
      <form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3 style={{ margin: '0 0 12px', fontSize: 20 }}>Edit your name</h3>
        {err && <div className="err">{err}</div>}
        <input className="input" value={v} onChange={(e) => setV(e.target.value)} placeholder="Full name" autoComplete="name" autoFocus />
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        <button type="button" className="btn ghost" style={{ marginTop: 10 }} onClick={onClose}>Cancel</button>
      </form>
    </div>
  )
}

function PasswordSheet({ onClose }) {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const save = async (e) => {
    e.preventDefault()
    if (pw.length < 6) return setErr('Use at least 6 characters.')
    if (pw !== pw2) return setErr('The two passwords do not match.')
    setBusy(true); setErr('')
    const { error } = await supabase.auth.updateUser({ password: pw })
    setBusy(false)
    if (error) return setErr(error.message)
    setDone(true)
  }
  return (
    <div className="sheet-bg" onClick={onClose}>
      <form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3 style={{ margin: '0 0 12px', fontSize: 20 }}>Change password</h3>
        {done ? (
          <>
            <div className="ok" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Check size={18} /> Password changed.</div>
            <button type="button" className="btn" onClick={onClose}>Done</button>
          </>
        ) : (
          <>
            {err && <div className="err">{err}</div>}
            <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" autoComplete="new-password" minLength={6} />
            <input className="input" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Repeat new password" autoComplete="new-password" minLength={6} />
            <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
            <button type="button" className="btn ghost" style={{ marginTop: 10 }} onClick={onClose}>Cancel</button>
          </>
        )}
      </form>
    </div>
  )
}
