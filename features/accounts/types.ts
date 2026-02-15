export interface Account {
  id: string
  user_id: string
  name: string
  broker?: string | null
  currency: string
  is_default: boolean
  created_at: string
  mt5_login?: number | null
  mt5_password?: string | null
  mt5_server?: string | null
}

export interface CreateAccountDTO {
  name: string
  broker?: string | null
  currency?: string
  is_default?: boolean
  mt5_login?: number
  mt5_password?: string | null
  mt5_server?: string | null
}
