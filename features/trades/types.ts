import { z } from "zod"

export type TradeStatus = 'OPEN' | 'CLOSED'
export type TradeDirection = 'LONG' | 'SHORT'

export const tradeSchema = z.object({
  symbol: z.string().min(1, "El símbolo es requerido").toUpperCase(),
  entry_price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "Debe ser un número positivo")
  ),
  exit_price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0).optional().nullable()
  ),
  size: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "Debe ser mayor a 0")
  ),
  direction: z.enum(['LONG', 'SHORT']),
  status: z.enum(['OPEN', 'CLOSED']).default('OPEN'),
  pnl: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().optional().nullable()
  ),
  notes: z.string().optional(),
  mood: z.string().optional(),
  emotions: z.array(z.string()).optional().default([]),
  account_id: z.string().min(1, "Account is required"),
})

export type TradeFormValues = z.infer<typeof tradeSchema>

export interface Trade extends TradeFormValues {
  id: string
  user_id: string
  created_at: string
  account_id: string
  mt5_position_id?: number | null
}
