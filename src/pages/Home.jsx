import { useNavigate } from 'react-router-dom'
import { Menu, Lock, Bell, CalendarDays, CalendarCheck, PlayCircle, Crown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import InstallBanner from '../components/InstallBanner'

export default function Home() {
  const nav = useNavigate()
  const { hasFullAccess } = useAuth()
  return (
    <>
      <header className="topbar-home">
        <button className="icon-btn" style={{ color: 'var(--green)' }} onClick={() => nav('/profile')} aria-label="Menu"><Menu size={30} /></button>
        <div className="title">JAMB/UTME</div>
        {hasFullAccess
          ? <span className="pill-activate" style={{ background: 'var(--green)' }}><Crown size={18} /> Full access</span>
          : <button className="pill-activate" onClick={() => nav('/activate')}><Lock size={18} /> Activate</button>}
        <button className="bubble bell" aria-label="Notifications"><Bell size={22} /></button>
      </header>
      <main className="page has-nav">
        <InstallBanner />
        <section className="hero">
          <span className="chip">Ready when you are</span>
          <h2>Learn with clarity. Practise with confidence.</h2>
          <p>Everything you need to prepare, improve, and feel ready for exam day.</p>
          <img src="/hero.jpg" alt="Two students reading together" />
        </section>

        <section className="card" style={{ marginTop: 18 }}>
          <div className="feature">
            <div className="row"><div className="tile green"><PlayCircle size={28} /></div><h3>Practice JAMB questions</h3></div>
            <p style={{ margin: '0 0 14px' }}>Pick your subjects, then take a timed CBT exam or study with explanations.</p>
            <button className="btn" onClick={() => nav('/practice')}>Start practice</button>
          </div>
        </section>

        <section className="card">
          <div className="feature">
            <div className="row"><div className="tile green"><CalendarDays size={28} /></div><h3>Personalized Daily Study Plan</h3></div>
            <p style={{ margin: '0 0 14px' }}>Set your exam target, study days, weak subjects, and practice style.</p>
            <button className="btn" onClick={() => alert('Daily study plans are coming soon.')}><CalendarCheck size={20} /> Create Plan</button>
          </div>
        </section>
      </main>
    </>
  )
}
