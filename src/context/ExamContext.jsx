import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)
export const useExam = () => useContext(Ctx)

// Holds the current practice session in memory:
//  setup  -> { type, subjects: [{ id, name, filter, filterLabel, count }] }
//  paper  -> [{ subject, questions: [...] }]  (loaded when the exam starts)
//  mode   -> 'exam' | 'study'
//  result -> filled when the user submits
export function ExamProvider({ children }) {
  const [setup, setSetup] = useState(null)
  const [paper, setPaper] = useState([])
  const [mode, setMode] = useState('exam')
  const [endAt, setEndAt] = useState(null)
  const [result, setResult] = useState(null)
  return (
    <Ctx.Provider value={{ setup, setSetup, paper, setPaper, mode, setMode, endAt, setEndAt, result, setResult }}>
      {children}
    </Ctx.Provider>
  )
}
