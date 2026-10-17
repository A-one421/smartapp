import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Timer, LayoutGrid, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { useExam } from '../context/ExamContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { LETTERS, optionText, gradePaper } from '../lib/questions'

const fmt = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`
}

export default function Exam() {
  const nav = useNavigate()
  const { user } = useAuth()
  const { paper, mode, endAt, setResult } = useExam()
  const [answers, setAnswers] = useState({})
  const [sIdx, setSIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [showGrid, setShowGrid] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [left, setLeft] = useState(endAt ? Math.max(0, Math.round((endAt - Date.now()) / 1000)) : null)
  const submitted = useRef(false)
  const study = mode === 'study'

  useEffect(() => { if (!paper.length) nav('/jamb', { replace: true }) }, [paper, nav])

  const submit = useCallback(async () => {
    if (submitted.current) return
    submitted.current = true
    const graded = gradePaper(paper, answers)
    const res = { ...graded, answers, mode, paper }
    setResult(res)
    nav('/results', { replace: true })
    // Save in the background; the user already sees their result.
    try {
      const { data: att } = await supabase.from('attempts')
        .insert({ user_id: user.id, mode, total_score: graded.correct, total_questions: graded.total })
        .select('id').single()
      if (att) {
        const rows = paper.flatMap((p) => p.questions).map((q) => ({
          attempt_id: att.id, question_id: q.id, chosen_option: answers[q.id] || null
        }))
        await supabase.from('attempt_answers').insert(rows)
      }
    } catch (e) { console.warn('Could not save attempt', e) }
  }, [paper, answers, mode, user, nav, setResult])

  // Countdown. Uses the end timestamp so it stays correct if the tab sleeps.
  useEffect(() => {
    if (!endAt) return
    const t = setInterval(() => {
      const s = Math.max(0, Math.round((endAt - Date.now()) / 1000))
      setLeft(s)
      if (s <= 0) { clearInterval(t); submit() }
    }, 1000)
    return () => clearInterval(t)
  }, [endAt, submit])

  // Warn before accidentally leaving mid-exam.
  useEffect(() => {
    const h = (e) => { if (!submitted.current) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [])

  const cur = paper[sIdx]
  const q = cur?.questions[qIdx]
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])
  const totalQ = useMemo(() => paper.reduce((s, p) => s + p.questions.length, 0), [paper])
  if (!q) return null

  const picked = answers[q.id]
  const locked = study && picked
  const choose = (L) => { if (!locked) setAnswers((a) => ({ ...a, [q.id]: L })) }

  const go = (si, qi) => { setSIdx(si); setQIdx(qi); setShowGrid(false); window.scrollTo(0, 0) }
  const next = () => {
    if (qIdx < cur.questions.length - 1) go(sIdx, qIdx + 1)
    else if (sIdx < paper.length - 1) go(sIdx + 1, 0)
  }
  const prev = () => {
    if (qIdx > 0) go(sIdx, qIdx - 1)
    else if (sIdx > 0) go(sIdx - 1, paper[sIdx - 1].questions.length - 1)
  }
  const isLast = sIdx === paper.length - 1 && qIdx === cur.questions.length - 1
  const isFirst = sIdx === 0 && qIdx === 0

  const optClass = (L) => {
    if (study && picked) {
      if (L === q.correct_option) return 'opt right'
      if (L === picked) return 'opt wrong'
      return 'opt'
    }
    return picked === L ? 'opt sel' : 'opt'
  }

  return (
    <>
      <header className="exam-top">
        <div className="r1">
          <b>{study ? 'Study mode' : 'Exam mode'}</b>
          {left !== null && <span className={`timer ${left < 300 ? 'low' : ''}`}><Timer size={18} /> {fmt(left)}</span>}
          <button className="icon-btn" onClick={() => setShowGrid(true)} aria-label="Question navigator"><LayoutGrid size={24} /></button>
        </div>
        <div className="tabs" role="tablist">
          {paper.map((p, i) => (
            <button key={p.subject.id} role="tab" aria-selected={i === sIdx} className={i === sIdx ? 'on' : ''} onClick={() => go(i, 0)}>{p.subject.name}</button>
          ))}
        </div>
      </header>

      <main className="page has-sticky">
        <div className="qcard">
          <div className="qmeta">
            <span>Question {qIdx + 1} of {cur.questions.length}</span>
            <span>{answeredCount}/{totalQ} answered</span>
          </div>
          {q.image_url && <img className="qimg" src={q.image_url} alt="Question diagram" />}
          <div className="qtext">{q.question_text}</div>
          {LETTERS.map((L) => (
            <button key={L} className={optClass(L)} onClick={() => choose(L)} aria-pressed={picked === L}>
              <span className="l">{L}</span><span>{optionText(q, L)}</span>
            </button>
          ))}
          {locked && (
            <div className="explain">
              <b>{picked === q.correct_option ? 'Correct.' : `Wrong. The answer is ${q.correct_option}.`}</b>
              {q.explanation && <div style={{ marginTop: 6 }}>{q.explanation}</div>}
            </div>
          )}
        </div>
      </main>

      <div className="sticky-action" style={{ background: 'var(--page)', boxShadow: '0 -4px 16px rgba(20,60,30,.08)' }}>
        <div className="qnav" style={{ marginTop: 0 }}>
          <button className="btn ghost" onClick={prev} disabled={isFirst}><ChevronLeft size={20} /> Prev</button>
          {isLast
            ? <button className="btn danger" onClick={() => setConfirm(true)}><Send size={18} /> Submit</button>
            : <button className="btn" onClick={next}>Next <ChevronRight size={20} /></button>}
        </div>
      </div>

      {showGrid && (
        <div className="sheet-bg" onClick={() => setShowGrid(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px' }}>Question navigator</h3>
            {paper.map((p, si) => (
              <div key={p.subject.id} style={{ marginTop: 14 }}>
                <b>{p.subject.name}</b>
                <div className="grid-nav">
                  {p.questions.map((x, qi) => (
                    <button key={x.id} className={`${answers[x.id] ? 'done' : ''} ${si === sIdx && qi === qIdx ? 'cur' : ''}`} onClick={() => go(si, qi)}>{qi + 1}</button>
                  ))}
                </div>
              </div>
            ))}
            <button className="btn danger" style={{ marginTop: 20 }} onClick={() => { setShowGrid(false); setConfirm(true) }}><Send size={18} /> Submit exam</button>
          </div>
        </div>
      )}

      {confirm && (
        <div className="sheet-bg" onClick={() => setConfirm(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px' }}>Submit now?</h3>
            <p className="sub" style={{ marginBottom: 14 }}>
              You answered {answeredCount} of {totalQ} questions.
              {answeredCount < totalQ && ` ${totalQ - answeredCount} will be marked wrong.`}
            </p>
            <button className="btn danger" onClick={submit}>Yes, submit</button>
            <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => setConfirm(false)}>Keep working</button>
          </div>
        </div>
      )}
    </>
  )
}
