import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Session } from "@supabase/supabase-js"

import { isSupabaseConfigured, supabase } from "./supabase"
import type { Profile } from "./types"

interface AuthState {
  loading: boolean
  /** Signed-in admin profile; a synthetic one in demo mode. */
  profile: Profile | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const demoProfile: Profile = {
  id: "demo",
  email: "demo@teamx.dev",
  full_name: "Demo Admin",
  avatar_url: null,
  role: "super_admin",
  status: "active",
  last_sign_in_at: null,
  created_at: new Date().toISOString(),
}

const AuthContext = createContext<AuthState | null>(null)

async function loadAdminProfile(session: Session | null): Promise<Profile | null> {
  if (!supabase || !session) return null
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, status, last_sign_in_at, created_at")
    .eq("id", session.user.id)
    .single()
  if (error) throw error
  const profile = data as Profile
  // Only admins may use the dashboard; RLS would hide the data anyway.
  if (profile.role === "user") return null
  return profile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [profile, setProfile] = useState<Profile | null>(isSupabaseConfigured ? null : demoProfile)

  useEffect(() => {
    if (!supabase) return
    const client = supabase

    const apply = (session: Session | null) =>
      loadAdminProfile(session)
        .then(setProfile)
        .catch(() => setProfile(null))
        .finally(() => setLoading(false))

    client.auth.getSession().then(({ data }) => apply(data.session))
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      void apply(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase) return
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const admin = await loadAdminProfile(data.session)
    if (!admin) {
      await supabase.auth.signOut()
      throw new Error("This account does not have admin access.")
    }
    setProfile(admin)
  }

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
    setProfile(isSupabaseConfigured ? null : demoProfile)
  }

  return (
    <AuthContext.Provider value={{ loading, profile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
