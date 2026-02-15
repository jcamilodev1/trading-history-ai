'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { AuthFormValues, authSchema } from './types'

export async function login(data: AuthFormValues) {
  const supabase = await createClient()

  // Validate data
  const result = authSchema.safeParse(data)
  if (!result.success) {
    return { error: 'Datos inválidos. Por favor verifica los campos.' }
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(result.data)

  if (error) {
    console.error('Login error:', error.message, error.status)
    return { error: error.message }
  }

  console.log('Login successful for user:', authData.user?.id)
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(data: AuthFormValues) {
  const supabase = await createClient()

  // Validate data
  const result = authSchema.safeParse(data)
  if (!result.success) {
    return { error: 'Datos inválidos. Por favor verifica los campos.' }
  }

  const { error } = await supabase.auth.signUp(result.data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth')
}
