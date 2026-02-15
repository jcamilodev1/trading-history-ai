'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/features/auth/hooks/useUserStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setIsLoading, clear } = useUserStore()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user)
        setSession(session)
        setIsLoading(false)
      } else {
        clear()
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setSession, setIsLoading, clear, supabase])

  return <>{children}</>
}
