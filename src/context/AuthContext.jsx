import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    if (!userId) return setProfile(null)
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    setProfile(data || null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      loadProfile(data.session?.user?.id).finally(() => setLoading(false))
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      // defer to avoid deadlocks inside the auth callback
      setTimeout(() => loadProfile(s?.user?.id), 0)
    })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const hasFullAccess = Boolean(
    profile && (profile.role === 'admin' || (profile.access_expires_at && new Date(profile.access_expires_at) > new Date()))
  )

  const value = {
    session, user: session?.user ?? null, profile, loading, hasFullAccess,
    refreshProfile: () => loadProfile(session?.user?.id),
    signUp: (name, email, password) =>
      supabase.auth.signUp({ email, password, options: { data: { name } } }),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    google: () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }),
    signOut: () => supabase.auth.signOut()
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
