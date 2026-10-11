import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Play, Timer, Lightbulb } from 'lucide-react'
import { useExam } from '../context/ExamContext'
import { useAuth } from '../context/AuthContext'
import { GreenBar } from '../components/Layout'
import { fetchSubjectQuestions } from '../lib/questions'
import { EXAM_SECONDS } from '../config'

export default function PrepareExam() {
  const nav = useNavigate()
  const { setup, mode, setMode, setPaper, setEndAt, setResult } = useExam()
  const { hasFullAccess } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (!setup) nav('/practice', { replace: true }) }, [setup, nav])
  if (!setup) return null

  const total = setup.subjects.reduce((s, x) => s + x.count, 0)

  const start = async () => {
    setBusy(true); setError('')
    try {
      const paper = []
      for (const subject of setup.subjects) {
        const questions = await fetchSubjectQuestions(setup.type, subject)
        paper.push({ subject, questions })
      }
      const got = paper.reduce((s, p) => s + p.questions.length, 0)
      if (got === 0) {
        setError(hasFullAccess
          ? 'No questions found for these choices yet. Try another session.'
          : 'No free questions here yet. Activate full access to unlock every question.')
        return
      }
      setPaper(paper)
      setResult(null)
      setEndAt(mode === 'exam' ? Date.now() + Math.min(EXAM_SECONDS, got * 40) * 1000 : null)
      nav('/exam', { replace: true })
    } catch (e) {
      setError(e.message || 'Could not load questions. Check your connection and try again.')
    } finally { setBusy(false) }
  }

  return (
    <>
      <GreenBar title="Prepare Exam" subtitle="Review your setup before you begin" />
      <main className="page has-sticky">
        <h2 className="big">Ready when you are</h2>
        <p className="sub">Confirm the exam details and choose how you want to answer.</p>

        <section className="card">
          <div className="card-title"><ClipboardCheck color="var(--green)" size={28} /> Exam summary <span className="count">{total} questions</span></div>
          <p style={{ margin: '8px 0 6px', color: 'var(--ink-2)' }}>Review your subjects and sessions before starting.</p>
          {setup.subjects.map((s, i) => (
            <div className="sum-row" key={s.id}>
              <div className="num">{i + 1}</div>
              <div className="meta"><b>{s.name}</b><span>{s.filter}</span></div>
              <div className="qn"><b>{s.count}</b><span>questions</span></div>
            </div>
          ))}
        </section>

        <section className="card">
          <div className="card-title" style={{ fontSize: 20 }}>Exam options</div>
          <div className="seg">
            <button className={mode === 'exam' ? 'on' : ''} onClick={() => setMode('exam')}>
              <b><Timer size={16} style={{ verticalAlign: '-3px' }} /> Exam mode</b><span>Timed CBT. Answers shown at the end.</span>
            </button>
            <button className={mode === 'study' ? 'on' : ''} onClick={() => setMode('study')}>
              <b><Lightbulb size={16} style={{ verticalAlign: '-3px' }} /> Study mode</b><span>No timer. See the answer after each question.</span>
            </button>
          </div>
          {!hasFullAccess && <div className="notice" style={{ marginTop: 12, marginBottom: 0 }}>You are on the free plan, so you may get fewer questions than requested.</div>}
          {error && <div className="err" style={{ marginTop: 12, marginBottom: 0 }} role="alert">{error}</div>}
        </section>
      </main>

      <div className="sticky-action" style={{ background: 'none' }}>
        <button className="btn" onClick={start} disabled={busy}><Play size={18} fill="#fff" /> {busy ? 'Loading questions…' : 'Start exam'}</button>
      </div>
    </>
  )
}
