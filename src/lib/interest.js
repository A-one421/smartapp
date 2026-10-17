import { supabase } from './supabase'

// Records that a student is interested in an exam (jamb | waec | postutme).
// Safe to call many times: duplicates are ignored. The admin dashboard reads this.
export async function recordInterest(userId, exam) {
  try {
    await supabase.from('exam_interests').upsert({ user_id: userId, exam }, { onConflict: 'user_id,exam', ignoreDuplicates: true })
  } catch (e) { console.warn('interest not saved', e) }
}
