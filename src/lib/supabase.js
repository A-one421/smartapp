import { createClient } from '@supabase/supabase-js'

// Remember if this page was opened from a "reset password" email link.
// This must run BEFORE the client starts, because the client removes the link
// details from the address bar as soon as it reads them.
const RECOVERY_KEY = 'smartapp-recovery'
try {
  if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
    sessionStorage.setItem(RECOVERY_KEY, '1')
  }
} catch { /* storage blocked */ }

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(url && key)
export const supabase = createClient(url || 'http://localhost', key || 'missing', {
  auth: { persistSession: true, autoRefreshToken: true }
})

// Listen straight away (before React starts) so this signal is never missed.
supabase.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    try { sessionStorage.setItem(RECOVERY_KEY, '1') } catch { /* ignore */ }
    window.dispatchEvent(new Event('smartapp-recovery'))
  }
})

export const isRecovery = () => {
  try { return sessionStorage.getItem(RECOVERY_KEY) === '1' } catch { return false }
}
export const clearRecovery = () => {
  try { sessionStorage.removeItem(RECOVERY_KEY) } catch { /* ignore */ }
}
