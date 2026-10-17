import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Gem, CalendarDays } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useExam } from '../context/ExamContext'
import { GreenBar } from '../components/Layout'
import { loadCombo } from '../lib/combo'
import { buildPaper, examSeconds } from '../lib/questions'
import { TRACKS, ENGLISH_DEFAULT, OTHER_DEFAULT, FREE_PER_SUBJECT, SECONDS_PER_QUESTION, EXAM_SECONDS } from '../config'

const fmtDuration = (min) => (min >= 60 && min % 60 === 0 ? `${min / 60} hrs` : `${min} min`)

export default function ExamSetup() {
  const nav = useNavigate()
  const { hasFullAccess } = useAuth()
  const { setSetup, setPaper, setMode, setEndAt, setResult } = useExam()
  const combo = useMemo(() => loadCombo('jamb'), [])
  const [subjects, setSubjects] = useState([])
  const [filters, setFilters] = useState([])
  const [year, setYear] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (!combo) nav('/jamb/setup', { replace: true }) }, [combo, nav])
  useEffect(() => {
    (async () => {
      const [s, f] = await Promise.all([
        supabase.from('subjects').select('*').order('sort_order'),
        supabase.rpc('available_filters')
      ])
      setSubjects(s.data || [])
      setFilters(f.data || [])
    })()
  }, [])

  if (!combo) return null
  const track = TRACKS.find((t) => t.id === combo.track)
  const english = subjects.find((s) => s.is_compulsory)
  const mine = [english, ...combo.subjects.map((n) => subjects.find((s) => s.name === n))].filter(Boolean)
    .map((s) => ({ ...s, count: hasFullAccess ? (s.is_compulsory ? ENGLISH_DEFAULT : OTHER_DEFAULT) : FREE_PER_SUBJECT }))
  const total = mine.reduce((n, s) => n + s.count, 0)
  const minutes = Math.min(EXAM_SECONDS / 60, Math.ceil((total * SECONDS_PER_QUESTION) / 60))
  const ids = new Set(mine.map((s) => s.id))
  const years = [...new Set(filters.filter((r) => r.kind === 'session' && ids.has(r.subject_id)).map((r) => r.value))]
    .sort((a, b) => String(b).localeCompare(String(a), undefined, { numeric: true }))

  const start = async () => {
    setBusy(true); setError('')
    try {
      const setup = { type: 'exam', subjects: mine.map((s) => ({ id: s.id, name: s.name, icon: s.icon, filter: year, count: s.count })) }
      const paper = await buildPaper(setup)
      const got = paper.reduce((n, p) => n + p.questions.length, 0)
      if (!got) {
        setError(hasFullAccess ? 'No questions found yet. Try a different year.' : 'No free questions found for this choice. Unlock full access to practise everything.')
        return
      }
      setSetup(setup); setPaper(paper); setMode('exam'); setResult(null)
      setEndAt(Date.now() + examSeconds(got) * 1000)
      nav('/exam', { replace: true })
    } catch (e) {
      setError(e.message || 'Could not load questions. Check your connection.')
    } finally { setBusy(false) }
  }

  return (
    <>
      <GreenBar title="Exam Setup" subtitle="Confirm before starting" backTo="/jamb" />
      <main className="page has-sticky">
        <section className="card es-sum">
          <div className="es-label">JAMB · {track?.label} · Exam session</div>
          <div className="es-stats">
            <div><b>{total}</b><span>Total questions</span></div>
            <div><b>{mine.length}</b><span>Subjects</span></div>
            <div><b>{fmtDuration(minutes)}</b><span>Duration</span></div>
          </div>
        </section>

        <h3 className="dash-title">Questions per subject</h3>
        {!hasFullAccess && <p className="hint" style={{ marginTop: -6 }}>Free trial is fixed at {FREE_PER_SUBJECT} questions per subject.</p>}
        <section className="card" style={{ padding: '4px 18px' }}>
          {mine.map((s) => (
            <div className="qs-row" key={s.id}><span>{s.name}</span><b>{s.count} qns</b></div>
          ))}
        </section>

        {!hasFullAccess && (
          <div className="unlock-card">
            <Gem size={22} color="var(--plum)" />
            <div>
              <b>Want the full exam?</b>
              <span>Unlock {ENGLISH_DEFAULT} English questions and {OTHER_DEFAULT} for each other subject, with a full 2-hour paper.</span>
              <button className="btn small" style={{ marginTop: 10, boxShadow: 'none' }} onClick={() => nav('/activate')}>Unlock full access</button>
            </div>
          </div>
        )}

        <h3 className="dash-title" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><CalendarDays size={20} /> Past question year</h3>
        <select className="input" value={year} onChange={(e) => setYear(e.target.value)} aria-label="Past question year">
          <option value="">All years (mixed)</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <p className="hint" style={{ marginTop: 0 }}>If a subject has fewer questions than listed, you get what is available.</p>

        {error && <div className="err" role="alert">{error}</div>}
      </main>

      <div className="sticky-action" style={{ background: 'none' }}>
        <button className="btn" onClick={start} disabled={busy || mine.length === 0}><Play size={18} fill="#fff" /> {busy ? 'Loading questions…' : 'Start exam'}</button>
      </div>
    </>
  )
}
