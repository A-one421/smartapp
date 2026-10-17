import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Crown, ChevronRight, GraduationCap, ScrollText, Building2, Timer, Lightbulb, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import InstallBanner from '../components/InstallBanner'
import HeroArt from '../components/HeroArt'
import { recordInterest } from '../lib/interest'
import { EXAMS } from '../config'

const ICONS = { jamb: GraduationCap, waec: ScrollText, postutme: Building2 }
const TONES = { jamb: 'emerald', waec: 'amber', postutme: 'sky' }

export default function Home() {
  const nav = useNavigate()
  const { profile, user, hasFullAccess } = useAuth()
  const name = (profile?.name || user?.email?.split('@')[0] || 'Student').split(' ')[0]
  const [soon, setSoon] = useState(null)   // exam shown in the "coming soon" sheet
  const [notified, setNotified] = useState(false)

  const notify = async () => {
    await recordInterest(user.id, soon.id)
    setNotified(true)
  }
  const closeSheet = () => { setSoon(null); setNotified(false) }

  return (
    <main className="page has-nav hm">
      <header className="hm-head">
        <div className="hm-avatar" aria-hidden="true">{name[0]?.toUpperCase()}</div>
        <div className="hm-hello">
          <span>Welcome back,</span>
          <b>{name}</b>
        </div>
        {hasFullAccess
          ? <span className="hm-pro"><Crown size={16} /> Full access</span>
          : <button className="hm-unlock" onClick={() => nav('/activate')}><Lock size={16} /> Unlock all</button>}
      </header>

      <InstallBanner />

      <section className="hm-hero compact">
        <div>
          <span className="hm-eyebrow">EXAM PRACTICE</span>
          <h2>Pick your exam. Start practising.</h2>
        </div>
        <HeroArt compact />
      </section>

      <h3 className="hm-title">Choose your exam</h3>
      <div className="ex-list">
        {EXAMS.map((ex) => {
          const Icon = ICONS[ex.id] || GraduationCap
          return (
            <button
              key={ex.id}
              className={`ex-card ${TONES[ex.id]} ${ex.available ? '' : 'off'}`}
              onClick={() => (ex.available ? nav(`/${ex.id}`) : setSoon(ex))}
            >
              <span className="hm-ic"><Icon size={26} /></span>
              <span className="ex-text">
                <b>{ex.name}</b>
                <span>{ex.desc}</span>
              </span>
              {ex.available ? <ChevronRight size={22} /> : <em className="soon">Coming soon</em>}
            </button>
          )
        })}
      </div>

      <h3 className="hm-title">Two ways to learn</h3>
      <div className="hm-modes">
        <div><Timer size={22} /><b>Exam mode</b><span>Timed like the real CBT. Results at the end.</span></div>
        <div><Lightbulb size={22} /><b>Study mode</b><span>No timer. See the answer after every question.</span></div>
      </div>

      {soon && (
        <div className="sheet-bg" onClick={closeSheet}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 6px', fontSize: 20 }}>{soon.name} is coming soon</h3>
            <p className="sub" style={{ margin: '0 0 16px' }}>We are preparing the questions. Tap below and we will know you want it.</p>
            {notified
              ? <div className="ok" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Check size={18} /> Done. We will let you know when it opens.</div>
              : <button className="btn" onClick={notify}>Notify me</button>}
            <button className="link" style={{ width: '100%', marginTop: 8 }} onClick={closeSheet}>Close</button>
          </div>
        </div>
      )}
    </main>
  )
}
