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
