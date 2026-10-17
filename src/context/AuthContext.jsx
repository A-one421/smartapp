import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isRecovery, clearRecovery } from '../lib/supabase'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  // True while the student is setting a new password after clicking the reset link in their email.
  const [recovery, setRecovery] = useState(() => isRecovery())

  const loadProfile = useCallback(async (userId) => {
    if (!userId) return setProfile(null)
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    setProfile(data || null)
  }, [])

  useEffect(() => {
    const onRecovery = () => setRecovery(true)
    window.addEventListener('smartapp-recovery', onRecovery)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      loadProfile(data.session?.user?.id).finally(() => setLoading(false))
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      setSession(s)
      // defer to avoid deadlocks inside the auth callback
      setTimeout(() => loadProfile(s?.user?.id), 0)
    })
    return () => { sub.subscription.unsubscribe(); window.removeEventListener('smartapp-recovery', onRecovery) }
  }, [loadProfile])

  const hasFullAccess = Boolean(
    profile && (profile.role === 'admin' || (profile.access_expires_at && new Date(profile.access_expires_at) > new Date()))
  )

  const value = {
    session, user: session?.user ?? null, profile, loading, hasFullAccess, recovery,
    finishRecovery: () => { clearRecovery(); setRecovery(false) },
    refreshProfile: () => loadProfile(session?.user?.id),
    signUp: (name, email, password) =>
      supabase.auth.signUp({ email, password, options: { data: { name } } }),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    google: () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }),
    signOut: () => supabase.auth.signOut()
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
