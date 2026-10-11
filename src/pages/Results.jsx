import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, RotateCcw } from 'lucide-react'
import { useExam } from '../context/ExamContext'
import { GreenBar } from '../components/Layout'
import { LETTERS, optionText } from '../lib/questions'

export default function Results() {
  const nav = useNavigate()
  const { result } = useExam()
  const [open, setOpen] = useState(null)
  useEffect(() => { if (!result) nav('/', { replace: true }) }, [result, nav])
  if (!result) return null

  const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0
  const wrong = result.paper.flatMap((p) => p.questions.filter((q) => result.answers[q.id] !== q.correct_option).map((q) => ({ ...q, subjectName: p.subject.name })))

  return (
    <>
      <GreenBar title="Your result" subtitle={result.mode === 'exam' ? 'Exam mode' : 'Study mode'} back={false} />
      <main className="page">
        <section className="card center">
          <div className="score-ring" style={{ '--pct': `${pct}%` }}><b>{pct}%</b></div>
          <div className="big" style={{ fontSize: 24 }}>{result.correct} of {result.total} correct</div>
          {result.jamb !== null && <p className="sub" style={{ margin: 0 }}>Estimated JAMB score: <b>{result.jamb}/400</b></p>}
        </section>

        <section className="card">
          <div className="card-title" style={{ fontSize: 19 }}>Score by subject</div>
          {result.subjects.map((s) => {
            const p = s.total ? Math.round((s.correct / s.total) * 100) : 0
            return (
              <div key={s.name} style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{s.name}</b><span>{s.correct}/{s.total}</span></div>
                <div className="bar"><i style={{ width: `${p}%` }} /></div>
              </div>
            )
          })}
        </section>

        <section className="card">
          <div className="card-title" style={{ fontSize: 19 }}>Review mistakes <span className="count" style={{ color: 'var(--red)' }}>{wrong.length}</span></div>
          {wrong.length === 0 && <p className="sub" style={{ margin: '10px 0 0' }}>No mistakes. Well done.</p>}
          {wrong.map((q, i) => {
            const mine = result.answers[q.id]
            return (
              <div key={q.id} style={{ borderTop: '1px solid var(--line)', marginTop: 14, paddingTop: 14 }}>
                <button className="link" style={{ padding: 0, textAlign: 'left', color: 'var(--ink)', fontWeight: 500 }} onClick={() => setOpen(open === q.id ? null : q.id)}>
                  <small style={{ color: 'var(--ink-2)', display: 'block' }}>{q.subjectName}</small>{i + 1}. {q.question_text.slice(0, 120)}{q.question_text.length > 120 ? '…' : ''}
                </button>
                {open === q.id && (
                  <div style={{ marginTop: 10 }}>
                    {LETTERS.map((L) => (
                      <div key={L} className={`opt ${L === q.correct_option ? 'right' : L === mine ? 'wrong' : ''}`} style={{ marginBottom: 6, padding: 10 }}>
                        <span className="l">{L}</span><span>{optionText(q, L)}</span>
                      </div>
                    ))}
                    <p style={{ margin: '8px 0 0', fontSize: 14 }}>{mine ? `You chose ${mine}.` : 'You skipped this one.'} Correct answer: <b>{q.correct_option}</b>.</p>
                    {q.explanation && <div className="explain">{q.explanation}</div>}
                  </div>
                )}
              </div>
            )
          })}
        </section>

        <button className="btn" onClick={() => nav('/practice')}><RotateCcw size={18} /> Practise again</button>
        <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => nav('/')}><Home size={18} /> Back to home</button>
      </main>
    </>
  )
}
