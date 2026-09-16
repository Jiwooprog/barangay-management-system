import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import type {
  Session,
  User,
} from "@supabase/supabase-js"

import { supabase } from "@/lib/supabase"
import type { UserRole } from "@/types/auth"

interface AuthContextType {
  session: Session | null
  user: User | null
  role: UserRole | null
  loading: boolean
  signIn: (
    email: string,
    password: string
  ) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  )

async function getUserRole(): Promise<UserRole | null> {
  const { data, error } = await supabase.rpc(
    "get_my_role"
  )

  if (error) {
    console.error(
      "Role lookup failed:",
      error
    )

    throw error
  }

  console.log("Loaded role:", data)

  return data as UserRole | null
}

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [session, setSession] =
    useState<Session | null>(null)

  const [role, setRole] =
    useState<UserRole | null>(null)

  const [initializing, setInitializing] =
    useState(true)

  const [roleLoading, setRoleLoading] =
    useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data,
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error(
          "Unable to get session:",
          error
        )
      }

      setSession(data.session)
      setInitializing(false)
    }

    void initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const loadRole = async () => {
      if (!session?.user) {
        setRole(null)
        return
      }

      try {
        setRoleLoading(true)

        const userRole =
          await getUserRole()

        setRole(userRole)
      } catch (error) {
        console.error(
          "Unable to load user role:",
          error
        )

        setRole(null)
      } finally {
        setRoleLoading(false)
      }
    }

    void loadRole()
  }, [session?.user.id])

  const signIn = async (
    email: string,
    password: string
  ) => {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    const { error } =
      await supabase.auth.signOut()

    if (error) {
      throw error
    }

    setSession(null)
    setRole(null)
  }

  const loading =
    initializing ||
    (Boolean(session?.user) &&
      roleLoading)

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        role,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    )
  }

  return context
}