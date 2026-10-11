import { useEffect, useRef, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { GreenBar } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { PLANS } from '../config'

const naira = (kobo) => '₦' + (kobo / 100).toLocaleString('en-NG')

function loadPaystack() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve()
    const s = document.createElement('script')
    s.src = 'https://js.paystack.co/v1/inline.js'
    s.onload = resolve
    s.onerror = () => reject(new Error('Could not load Paystack. Check your connection.'))
    document.body.appendChild(s)
  })
}

export default function Activate() {
  const { user, hasFullAccess, profile, refreshProfile } = useAuth()
  const [planId, setPlanId] = useState(PLANS[1].id)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [waiting, setWaiting] = useState(false)
  const poll = useRef(null)
  useEffect(() => () => clearInterval(poll.current), [])

  const pay = async () => {
    setErr(''); setMsg('')
    const plan = PLANS.find((p) => p.id === planId)
    const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
    if (!key) return setErr('Paystack key is missing. Add VITE_PAYSTACK_PUBLIC_KEY to your .env file.')
    try {
      await loadPaystack()
      const handler = window.PaystackPop.setup({
        key,
        email: user.email,
        amount: plan.amount,
        currency: 'NGN',
        ref: `smart_${user.id.slice(0, 8)}_${Date.now()}`,
        // The webhook reads this metadata to know who paid and for what.
        metadata: { user_id: user.id, plan: plan.id, days: plan.days },
        callback: () => {
          // Do NOT unlock here. Access is granted only by the verified webhook.
          setWaiting(true); setMsg('Payment received. Confirming…')
          let tries = 0
          poll.current = setInterval(async () => {
            tries++
            await refreshProfile()
            if (tries > 15) { clearInterval(poll.current); setWaiting(false); setMsg('Still confirming. Your access will appear shortly. Pull to refresh in a minute.') }
          }, 3000)
        },
        onClose: () => {}
      })
      handler.openIframe()
    } catch (e) { setErr(e.message) }
  }

  useEffect(() => {
    if (hasFullAccess && waiting) { clearInterval(poll.current); setWaiting(false); setMsg('You now have full access. Enjoy!') }
  }, [hasFullAccess, waiting])

  const expires = profile?.access_expires_at ? new Date(profile.access_expires_at).toLocaleDateString('en-NG', { dateStyle: 'long' }) : null

  return (
    <>
      <GreenBar title="Activate full access" subtitle="Unlock every question" />
      <main className="page">
        {hasFullAccess && <div className="ok">You have full access{expires ? ` until ${expires}` : ''}. You can extend it below.</div>}
        {err && <div className="err" role="alert">{err}</div>}
        {msg && <div className="ok">{msg}</div>}
        <p className="sub">Free users get a limited set of questions. Choose a plan to unlock all subjects, years and topics.</p>
        {PLANS.map((p) => (
          <button key={p.id} className={`plan ${planId === p.id ? 'on' : ''}`} onClick={() => setPlanId(p.id)} aria-pressed={planId === p.id}>
            <div><b>{p.name}</b><span>{p.note}</span></div>
            <div className="price">{naira(p.amount)}</div>
          </button>
        ))}
        <button className="btn" onClick={pay} disabled={waiting}><ShieldCheck size={20} /> {waiting ? 'Confirming…' : 'Pay with Paystack'}</button>
        <p className="center" style={{ color: 'var(--ink-2)', fontSize: 13 }}>Secure payment by Paystack. Card, bank transfer and USSD.</p>
      </main>
    </>
  )
}
