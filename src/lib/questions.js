import { supabase } from './supabase'
import { EXAM_SECONDS, SECONDS_PER_QUESTION } from '../config'

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Fetch the questions for one subject row from the setup.
// RLS decides what the user may see: free users only get is_free rows.
export async function fetchSubjectQuestions(type, subject) {
  let q = supabase.from('questions').select('*').eq('subject_id', subject.id)
  if ((type === 'year' || type === 'exam') && subject.filter) q = q.eq('session', subject.filter)
  if (type === 'class') q = q.eq('class_level', subject.filter)
  if (type === 'topic') q = q.eq('topic', subject.filter)
  const { data, error } = await q.limit(800)
  if (error) throw error
  return shuffle(data || []).slice(0, subject.count)
}

export const LETTERS = ['A', 'B', 'C', 'D']
export const optionText = (q, L) => q[`option_${L.toLowerCase()}`]

export function gradePaper(paper, answers) {
  const subjects = paper.map(({ subject, questions }) => {
    const correct = questions.filter((q) => answers[q.id] === q.correct_option).length
    return { name: subject.name, total: questions.length, correct }
  })
  const total = subjects.reduce((s, x) => s + x.total, 0)
  const correct = subjects.reduce((s, x) => s + x.correct, 0)
  // JAMB style: each of 4 subjects is marked out of 100, giving a total out of 400.
  const jamb = subjects.length === 4
    ? Math.round(subjects.reduce((s, x) => s + (x.total ? (x.correct / x.total) * 100 : 0), 0))
    : null
  return { subjects, total, correct, jamb }
}

// Loads every subject in a setup. Subjects with no matching questions are skipped.
export async function buildPaper(setup) {
  const paper = []
  for (const subject of setup.subjects) {
    const questions = await fetchSubjectQuestions(setup.type, subject)
    if (questions.length) paper.push({ subject, questions })
  }
  return paper
}

export const examSeconds = (count) => Math.min(EXAM_SECONDS, count * SECONDS_PER_QUESTION)
