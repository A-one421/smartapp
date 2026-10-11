import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarDays, FileQuestion, Check, CheckCircle2, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useExam } from '../context/ExamContext'
import { GreenBar } from '../components/Layout'
import { SubjectIcon } from '../lib/subjectIcons'
import { COUNT_OPTIONS, ENGLISH_DEFAULT, OTHER_DEFAULT } from '../config'

const KIND = { year: 'session', class: 'class', topic: 'topic' }
const LABEL = { year: 'Select Session', class: 'Select Class', topic: 'Select Topic' }

export default function SelectSubjects() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const type = ['topic', 'year', 'class'].includes(params.get('type')) ? params.get('type') : 'year'
  const { setSetup } = useExam()
  const isTopic = type === 'topic'
  const max = isTopic ? 1 : 4

  const [subjects, setSubjects] = useState([])
  const [filters, setFilters] = useState([]) // rows: { subject_id, kind, value, total }
  const [sel, setSel] = useState({})         // { [subjectId]: { filter, count } }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      const [s, f] = await Promise.all([
        supabase.from('subjects').select('*').order('sort_order'),
        supabase.rpc('available_filters')
      ])
      if (s.error) setError(s.error.message)
      setSubjects(s.data || [])
      setFilters(f.data || [])
      setLoading(false)
    })()
  }, [])

  const optionsFor = (id) =>
    filters.filter((r) => r.subject_id === id && r.kind === KIND[type]).map((r) => r.value)
      .sort((a, b) => String(b).localeCompare(String(a), undefined, { numeric: true }))

  const english = subjects.find((s) => s.is_compulsory)
  const defaults = (s) => ({ filter: optionsFor(s.id)[0], count: isTopic ? 20 : s.is_compulsory ? ENGLISH_DEFAULT : OTHER_DEFAULT })

  // English is always selected (and locked) outside topic mode.
  useEffect(() => {
    if (isTopic || !english || sel[english.id] || loading) return
    setSel((p) => ({ ...p, [english.id]: defaults(english) }))
  }, [english, loading, filters, isTopic]) // eslint-disable-line

  const toggle = (s) => {
    if (!isTopic && s.is_compulsory) return
    setSel((p) => {
      if (p[s.id]) { const n = { ...p }; delete n[s.id]; return n }
      if (isTopic) return { [s.id]: defaults(s) }
      if (Object.keys(p).length >= max) return p
      return { ...p, [s.id]: defaults(s) }
    })
  }
  const patch = (id, v) => setSel((p) => ({ ...p, [id]: { ...p[id], ...v } }))

  const chosen = useMemo(() => subjects.filter((s) => sel[s.id]), [subjects, sel])
  const valid = chosen.length >= 1 && chosen.length <= max && chosen.every((s) => sel[s.id].filter)

  const cont = () => {
    setSetup({
      type,
      subjects: chosen.map((s) => ({ id: s.id, name: s.name, icon: s.icon, filter: sel[s.id].filter, count: Number(sel[s.id].count) }))
    })
    nav('/prepare')
  }

  const Config = ({ s, compact }) => {
    const opts = optionsFor(s.id)
    return compact ? (
      <div className="subject-extra">
        <select className="select sm" aria-label={LABEL[type]} value={sel[s.id].filter || ''} onChange={(e) => patch(s.id, { filter: e.target.value })}>
          {opts.map((o) => <option key={o}>{o}</option>)}
        </select>
        <select className="select sm" aria-label="Questions" style={{ maxWidth: 90 }} value={sel[s.id].count} onChange={(e) => patch(s.id, { count: e.target.value })}>
          {COUNT_OPTIONS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
    ) : (
      <div className="card" style={{ padding: '8px 16px', marginBottom: 18 }}>
        <div className="field">
          <span className="label"><CalendarDays size={26} /> {LABEL[type]}</span>
          <select className="select" value={sel[s.id]?.filter || ''} onChange={(e) => patch(s.id, { filter: e.target.value })}>
            {opts.length === 0 && <option value="">None yet</option>}
            {opts.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="field">
          <span className="label"><FileQuestion size={26} /> Questions</span>
          <select className="select" value={sel[s.id]?.count || ENGLISH_DEFAULT} onChange={(e) => patch(s.id, { count: e.target.value })}>
            {COUNT_OPTIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
    )
  }

  return (
    <>
      <GreenBar title="Select Subject Sessions" subtitle={isTopic ? 'Choose 1 subject and a topic' : 'Select between 1 - 4 subjects'} />
      <main className="page has-sticky">
        {loading && <div className="empty">Loading subjects…</div>}
        {error && <div className="err">{error}</div>}

        {!isTopic && english && sel[english.id] && (
          <>
            <div className="subject-row" style={{ marginBottom: 8 }}>
              <span className="ic"><SubjectIcon name={english.icon} size={26} /></span>
              <span className="name">{english.name} <small style={{ color: 'var(--ink-2)', fontWeight: 400 }}>(compulsory)</small></span>
              <span className="check on"><Check size={18} /></span>
            </div>
            <Config s={english} />
          </>
        )}

        {subjects.filter((s) => isTopic || !s.is_compulsory).map((s) => {
          const on = Boolean(sel[s.id])
          const empty = optionsFor(s.id).length === 0
          return (
            <div key={s.id}>
              <button className="subject-row" disabled={empty} style={empty ? { opacity: 0.5 } : null} onClick={() => toggle(s)} aria-pressed={on}>
                <span className="ic"><SubjectIcon name={s.icon} size={26} /></span>
                <span className="name">{s.name}{empty && <small style={{ display: 'block', fontWeight: 400, color: 'var(--ink-2)' }}>No questions yet</small>}</span>
                <span className={`check ${on ? 'on' : ''}`}>{on && <Check size={18} />}</span>
              </button>
              {on && <Config s={s} compact />}
            </div>
          )
        })}
      </main>

      <div className="sticky-action">
        <div className="card">
          <div className="status"><CheckCircle2 color="var(--green)" /> {chosen.length} of {max} subject{max > 1 ? 's' : ''} selected</div>
          <button className="btn" disabled={!valid} onClick={cont}><ArrowRight size={20} /> Continue to exam setup</button>
        </div>
      </div>
    </>
  )
}
