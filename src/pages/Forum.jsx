import { Users } from 'lucide-react'
export default function Forum() {
  return (
    <main className="page has-nav">
      <div className="empty" style={{ paddingTop: 120 }}>
        <div className="tile mint" style={{ margin: '0 auto 16px', width: 72, height: 72 }}><Users size={36} /></div>
        <h2 style={{ color: 'var(--ink)' }}>Forum is coming soon</h2>
        <p>Ask questions and study with other candidates. We are building it now.</p>
      </div>
    </main>
  )
}
