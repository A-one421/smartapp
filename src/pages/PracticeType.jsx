import { useNavigate } from 'react-router-dom'
import { BookOpenCheck, CalendarDays, GraduationCap, ArrowRight } from 'lucide-react'
import { GreenBar } from '../components/Layout'

const TYPES = [
  { id: 'topic', cls: 'green', tile: 'mint', Icon: BookOpenCheck, title: 'Practice by Topic', text: 'Focus on specific topics, revisit weak areas, and build mastery step by step.' },
  { id: 'year', cls: 'plum', tile: 'plum', Icon: CalendarDays, title: 'Practice by Year', text: 'Work through past questions from a year of your choice and get exam-ready.' },
  { id: 'class', cls: 'red', tile: 'red', Icon: GraduationCap, title: 'Practice by Class', text: 'Practise the topics and skills taught at a particular class level.' }
]

export default function PracticeType() {
  const nav = useNavigate()
  return (
    <>
      <GreenBar title="Practice Type" />
      <main className="page">
        {TYPES.map(({ id, cls, tile, Icon, title, text }) => (
          <button key={id} className={`option ${cls}`} onClick={() => nav(`/subjects?type=${id}`)}>
            <div className={`tile ${tile}`}><Icon size={28} /></div>
            <h3>{title}</h3>
            <p>{text}</p>
            <span className="go">Choose this option <ArrowRight size={22} /></span>
          </button>
        ))}
      </main>
    </>
  )
}
