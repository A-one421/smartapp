import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, Palette, Briefcase, Check, Lock, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { GreenBar } from '../components/Layout'
import { SubjectIcon } from '../lib/subjectIcons'
import { TRACKS, COMBO_SIZE } from '../config'
import { loadCombo, saveCombo } from '../lib/combo'

const TRACK_ICONS = { science: FlaskConical, arts: Palette, commercial: Briefcase }

// One-time setup: choose a department, then English + 3 subjects. Saved on this device.
export default function JambSetup() {
  const nav = useNavigate()
  const saved = loadCombo('jamb')
  const [step, setStep] = useState(saved ? 2 : 1)
  const [track, setTrack] = useState(saved?.track || null)
  const [picked, setPicked] = useState(saved?.subjects || [])
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    supabase.from('subjects').select('*').order('sort_order').then(({ data }) => setSubjects(data || []))
  }, [])

  const english = subjects.find((s) => s.is_compulsory)
  const current = TRACKS.find((t) => t.id === track)
  const list = subjects.filter((s) => !s.is_compulsory && current?.subjects.includes(s.name))

  const chooseTrack = (id) => {
    if (id !== track) setPicked([])
    setTrack(id)
    setStep(2)
  }
  const toggle = (name) =>
    setPicked((p) => (p.includes(name) ? p.filter((n) => n !== name) : p.length < COMBO_SIZE ? [...p, name] : p))

  const save = () => {
    saveCombo('jamb', { track, subjects: picked })
    nav('/jamb', { replace: true })
  }

  return (
    <>
      <GreenBar
        title={step === 1 ? 'Choose your department' : 'Pick your subjects'}
        subtitle={step === 1 ? 'JAMB UTME setup' : `${current?.label} · English + ${COMBO_SIZE} more`}
        backTo={saved ? '/jamb' : '/'}
      />
      <main className="page has-sticky">
        {step === 1 && (
          <>
            <p className="sub">This helps us show the right subjects. You only do this once.</p>
            {TRACKS.map((t) => {
              const Icon = TRACK_ICONS[t.id]
              return (
                <button key={t.id} className={`ex-card ${t.id === 'science' ? 'emerald' : t.id === 'arts' ? 'amber' : 'sky'}`} style={{ marginBottom: 12 }} onClick={() => chooseTrack(t.id)}>
                  <span className="hm-ic"><Icon size={26} /></span>
                  <span className="ex-text"><b>{t.label}</b><span>{t.desc}</span></span>
                  <ChevronRight size={22} />
                </button>
              )
            })}
          </>
        )}

        {step === 2 && (
          <>
            <div className="combo" style={{ marginBottom: 16 }}>
              <span className="pick locked"><Lock size={13} /> {english?.name || 'English'}</span>
              {picked.map((n) => (
                <button key={n} className="pick on" onClick={() => toggle(n)} aria-label={`Remove ${n}`}>{n} <span aria-hidden="true">×</span></button>
              ))}
              {Array.from({ length: COMBO_SIZE - picked.length }).map((_, i) => <span key={i} className="pick empty">Pick one</span>)}
            </div>

            <div className="combo-list">
              {list.map((s) => {
                const on = picked.includes(s.name)
                const full = !on && picked.length >= COMBO_SIZE
                return (
                  <button key={s.id} className={`combo-row ${on ? 'on' : ''}`} disabled={full} onClick={() => toggle(s.name)} aria-pressed={on}>
                    <span className="ic"><SubjectIcon name={s.icon} size={20} /></span>
                    <span className="name">{s.name}</span>
                    <span className={`check ${on ? 'on' : ''}`}>{on && <Check size={16} />}</span>
                  </button>
                )
              })}
            </div>
            <div className="center" style={{ marginTop: 14 }}>
              <button className="link" onClick={() => setStep(1)}>Change department</button>
            </div>
          </>
        )}
      </main>

      {step === 2 && (
        <div className="sticky-action">
          <div className="card">
            <div className="status">{picked.length} of {COMBO_SIZE} subjects chosen</div>
            <button className="btn" disabled={picked.length !== COMBO_SIZE} onClick={save}>Save and continue</button>
          </div>
        </div>
      )}
    </>
  )
}
