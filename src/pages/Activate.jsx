import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, Check } from 'lucide-react'
import { GreenBar } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { FULL_ACCESS, APP_NAME, naira } from '../config'
import { usePrice, fetchPayConfig } from '../lib/price'

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

const PERKS = [
  'Every question in every subject',
  'Full CBT exam: 60 English and 40 for each other subject',
  'Study by any year or topic, no limit',
  'Pay once. Log in on any phone and it is still yours.'
]
const REF_KEY = 'smartapp-last-ref'

export default function Activate() {
  const { user, hasFullAccess, refreshProfile } = useAuth()
  const price = usePrice()
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [checking, setChecking] = useState(false)
  const [lastRef, setLastRef] = useState(() => { try { return localStorage.getItem(REF_KEY) } catch { return null } })
  const poll = useRef(null)
  useEffect(() => () => clearInterval(poll.current), [])

  useEffect(() => {
    if (hasFullAccess && waiting) { clearInterval(poll.current); setWaiting(false); setMsg('Payment confirmed. You now have full access.') }
  }, [hasFullAccess, waiting])

  // Ask our server to confirm the payment with Paystack and unlock the account.
  // This does not depend on the webhook, so it works even if the webhook is late or misconfigured.
  const confirmPayment = async (reference) => {
    try { localStorage.setItem(REF_KEY, reference); setLastRef(reference) } catch { /* ignore */ }
    const { data, error } = await supabase.functions.invoke('paystack-webhook', { body: { reference } })
    await refreshProfile()
    return { ok: Boolean(data?.ok), message: data?.message || error?.message || 'Could not confirm the payment yet.' }
  }

  const pay = async () => {
    setErr(''); setMsg('')
    const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
    if (!key) return setErr('Paystack key is missing. Add VITE_PAYSTACK_PUBLIC_KEY to your .env file.')
    try {
      await loadPaystack()
      // Always the latest price and payout account set in the admin dashboard.
      const { price: amount, subaccount } = await fetchPayConfig()
      const handler = window.PaystackPop.setup({
        key,
        email: user.email,
        amount,
        currency: 'NGN',
        // When the admin has set a Paystack subaccount, the money settles to the owner's bank account.
        // The owner bears Paystack's fee, so your own account is never charged.
        ...(subaccount ? { subaccount, bearer: 'subaccount' } : {}),
        ref: `smart_${user.id.slice(0, 8)}_${Date.now()}`,
        metadata: {
          user_id: user.id, // the server reads this to know who paid
          plan: FULL_ACCESS.id,
          // These show on the Paystack dashboard, so you can tell this app's payments from your other app's.
          custom_fields: [
            { display_name: 'App', variable_name: 'app', value: APP_NAME },
            { display_name: 'Product', variable_name: 'product', value: 'Full access (JAMB CBT)' }
          ]
        },
        callback: (response) => {
          setWaiting(true); setMsg('Payment received. Confirming…')
          confirmPayment(response.reference) // unlock right away, then keep checking below
          let tries = 0
          poll.current = setInterval(async () => {
            tries++
            await refreshProfile()
            if (tries > 20) { clearInterval(poll.current); setWaiting(false); setMsg('Still confirming. Tap "Check my payment" below in a minute.') }
          }, 3000)
        },
        onClose: () => {}
      })
      handler.openIframe()
    } catch (e) { setErr(e.message) }
  }

  const recheck = async () => {
    setErr(''); setMsg(''); setChecking(true)
    const r = await confirmPayment(lastRef)
    setChecking(false)
    r.ok ? setMsg(r.message) : setErr(r.message)
  }

  return (
    <>
      <GreenBar title="Unlock full access" subtitle="One payment, yours for life" />
      <main className="page">
        {err && <div className="err" role="alert">{err}</div>}
        {msg && <div className="ok">{msg}</div>}

        {hasFullAccess && !waiting ? (
          <div className="card center">
            <div className="tile green" style={{ margin: '0 auto 12px', width: 64, height: 64, borderRadius: '50%' }}><Check size={32} /></div>
            <h2 style={{ margin: '0 0 6px' }}>You have full access</h2>
            <p className="sub" style={{ margin: 0 }}>It stays on your account. Log in on any phone and it is there.</p>
          </div>
        ) : (
          <>
            <section className="card center">
              <div style={{ color: 'var(--ink-2)', fontWeight: 600 }}>Full access</div>
              <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--green-dark)', lineHeight: 1.1, margin: '6px 0' }}>{naira(price)}</div>
              <div style={{ color: 'var(--ink-2)' }}>One-time payment. No monthly fees.</div>
            </section>
            <section className="card">
              {PERKS.map((t) => (
                <div key={t} style={{ display: 'flex', gap: 10, padding: '8px 0', alignItems: 'flex-start' }}>
                  <Check size={20} color="var(--green)" style={{ flex: 'none', marginTop: 2 }} /> <span>{t}</span>
                </div>
              ))}
            </section>
            <button className="btn" onClick={pay} disabled={waiting} style={{ marginTop: 16 }}><ShieldCheck size={20} /> {waiting ? 'Confirming…' : `Pay ${naira(price)} with Paystack`}</button>
            <p className="center" style={{ color: 'var(--ink-2)', fontSize: 13 }}>Secure payment by Paystack. Card, bank transfer and USSD.</p>
            {lastRef && (
              <div className="center" style={{ marginTop: 6 }}>
                <button className="link" onClick={recheck} disabled={checking}>{checking ? 'Checking…' : 'Paid already but not unlocked? Check my payment'}</button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
