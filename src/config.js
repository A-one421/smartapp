// Change the name here and it updates everywhere in the app.
export const APP_NAME = 'SMartApp'
export const APP_TAGLINE = 'Your study companion for every exam'
export const APP_YEAR = '2027'

// Paystack amounts are in kobo (₦1 = 100 kobo). Edit prices/durations here.
export const PLANS = [
  { id: 'monthly', name: '1 Month', amount: 150000, days: 30, note: 'Full access to all questions' },
  { id: 'termly', name: '3 Months', amount: 350000, days: 90, note: 'Best for one exam season' },
  { id: 'yearly', name: '12 Months', amount: 900000, days: 365, note: 'Best value' }
]

export const CLASS_LEVELS = ['SS1', 'SS2', 'SS3']
export const EXAM_SECONDS = 2 * 60 * 60 // JAMB: 2 hours for 180 questions
export const ENGLISH_DEFAULT = 60
export const OTHER_DEFAULT = 40
export const COUNT_OPTIONS = [10, 20, 40, 60]
export const FREE_PER_SUBJECT = 10   // free trial: questions per subject
export const SECONDS_PER_QUESTION = 45 // 40 questions = 30 min, 180 questions = capped at 2 hours
export const naira = (kobo) => '₦' + (kobo / 100).toLocaleString('en-NG')

// ---- Exams the user can choose from on the home screen ----
export const EXAMS = [
  { id: 'jamb', name: 'JAMB UTME', desc: 'Past questions and CBT practice for the UTME.', available: true },
  { id: 'waec', name: 'WAEC (SSCE)', desc: 'Practice for the West African senior school exam.', available: false },
  { id: 'postutme', name: 'Post-UTME', desc: 'School screening practice for your chosen university.', available: false }
]

// ---- Subject combination: English + any 3 others ----
export const COMBO_SIZE = 3
// Groups used to help students find their subjects. A subject may appear in more than one group.
// Names must match the `name` column in the subjects table.
export const TRACKS = [
  { id: 'science', label: 'Science', desc: 'Mathematics, Physics, Chemistry, Biology and more', subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Agric Science', 'Geography'] },
  { id: 'arts', label: 'Arts', desc: 'Literature, Government, CRK, IRK and more', subjects: ['Literature', 'Government', 'CRK', 'IRK', 'Arabic', 'Geography'] },
  { id: 'commercial', label: 'Commercial', desc: 'Economics, Commerce, Accounting and more', subjects: ['Economics', 'Commerce', 'Accounting', 'Mathematics', 'Government'] }
]
