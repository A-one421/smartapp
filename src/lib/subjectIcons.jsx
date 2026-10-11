import { BookOpen, Calculator, Atom, FlaskConical, Leaf, LineChart, Landmark, PenLine, Store, Receipt, Globe, Cross, Moon, Tractor, Languages } from 'lucide-react'

const map = {
  book: BookOpen, calculator: Calculator, atom: Atom, flask: FlaskConical, leaf: Leaf, chart: LineChart,
  landmark: Landmark, pen: PenLine, store: Store, ledger: Receipt, globe: Globe, cross: Cross, moon: Moon,
  tractor: Tractor, type: Languages
}
export function SubjectIcon({ name, size = 24 }) {
  const Icon = map[name] || BookOpen
  return <Icon size={size} strokeWidth={2} />
}
