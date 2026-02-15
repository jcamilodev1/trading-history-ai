"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { CreateAccountDTO, Account } from "./types"

export async function getAccounts() {
  const supabase = await createClient()

  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching accounts:", error)
    return []
  }

  return accounts as Account[]
}

export async function createAccount(data: CreateAccountDTO): Promise<{ data?: Account; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo." }
  }

  const { data: newAccount, error } = await supabase
    .from("accounts")
    .insert([{ ...data, user_id: user.id }])
    .select()
    .single()

  if (error) {
    console.error("Error creating account:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { data: newAccount as Account }
}

export async function updateAccount(id: string, data: Partial<CreateAccountDTO>): Promise<{ data?: Account; error?: string }> {
  const supabase = await createClient()

  const { data: updatedAccount, error } = await supabase
    .from("accounts")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating account:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { data: updatedAccount as Account }
}

export async function deleteAccount(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting account:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}
