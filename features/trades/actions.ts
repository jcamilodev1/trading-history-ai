'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { tradeSchema, TradeFormValues } from './types'

export async function createTrade(data: TradeFormValues) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debes iniciar sesión para registrar una operación.' }
  }

  // Validate data
  const result = tradeSchema.safeParse(data)
  if (!result.success) {
    return { error: 'Datos inválidos. Por favor verifica los campos.' }
  }

  const { error } = await supabase
    .from('trades')
    .insert({ ...result.data, user_id: user.id })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateTrade(id: string, data: TradeFormValues) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuario no autenticado.' }
  }

  const result = tradeSchema.safeParse(data)
  if (!result.success) {
    return { error: 'Datos inválidos.' }
  }

  const { error } = await supabase
    .from('trades')
    .update(result.data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTrade(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
