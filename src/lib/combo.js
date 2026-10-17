// Remembers the student's department and chosen subjects (the 3 besides English) on this device,
// so they only pick them once. Shape: { track: 'science', subjects: ['Mathematics', 'Physics', 'Chemistry'] }
const key = (exam) => `smartapp-combo-${exam}`

export function loadCombo(exam) {
  try {
    const v = JSON.parse(localStorage.getItem(key(exam)) || 'null')
    if (v && typeof v.track === 'string' && Array.isArray(v.subjects) && v.subjects.length === 3) return v
    return null
  } catch { return null }
}

export function saveCombo(exam, combo) {
  try { localStorage.setItem(key(exam), JSON.stringify(combo)) } catch { /* private mode */ }
}
