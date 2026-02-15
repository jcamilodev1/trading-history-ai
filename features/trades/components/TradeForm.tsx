"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, TrendingUp, TrendingDown } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import { tradeSchema, TradeFormValues, Trade } from "@/features/trades/types"
import { createTrade, updateTrade } from "@/features/trades/actions"
import { EmotionSelector } from "./EmotionSelector"
import { useAccountStore } from "@/features/accounts/stores/useAccountStore"
import { getAccounts } from "@/features/accounts/actions"


interface TradeFormProps {
  trade?: Trade
  onSuccess?: () => void
}

export function TradeForm({ trade, onSuccess }: TradeFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const accounts = useAccountStore((state) => state.accounts)
  const setAccounts = useAccountStore((state) => state.setAccounts)
  const selectedAccountId = useAccountStore((state) => state.selectedAccountId)

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema) as any,
    defaultValues: trade || {
      symbol: "",
      entry_price: undefined,
      exit_price: null,
      size: undefined,
      direction: "LONG",
      status: "OPEN",
      pnl: null,
      notes: "",
      mood: undefined,
      emotions: [],
      // Default to selected account if valid, otherwise first account
      account_id: (selectedAccountId && selectedAccountId !== "ALL") ? selectedAccountId : accounts[0]?.id || "",
    },
  })

  useEffect(() => {
    // Ensure accounts are loaded
    if (accounts.length === 0) {
      getAccounts().then((data) => {
        setAccounts(data)
        // If form account_id is empty, set it to the first account
        if (!form.getValues("account_id") && data.length > 0) {
          form.setValue("account_id", data.find(a => a.is_default)?.id || data[0].id)
        }
      })
    }
  }, [accounts.length, setAccounts, form])

  // Watch for changes to calculate P/L automatically
  const entryPrice = form.watch("entry_price")
  const exitPrice = form.watch("exit_price")
  const size = form.watch("size")
  const direction = form.watch("direction")
  const currentPnL = form.watch("pnl")

  useEffect(() => {
    if (entryPrice && exitPrice && size) {
      const multiplier = direction === "LONG" ? 1 : -1
      const pnlValue = (Number(exitPrice) - Number(entryPrice)) * Number(size) * multiplier
      // Redondear a 2 decimales
      const roundedPnL = Math.round(pnlValue * 100) / 100

      // Solo actualizar si es diferente y no es nulo (para no borrar input manual si el usuario lo prefiere)
      // Pero aquí queremos autocalcular.
      if (currentPnL !== roundedPnL) {
        form.setValue("pnl", roundedPnL)
      }
    } else if (currentPnL !== null) {
      // If any required value is missing, reset PnL to null
      form.setValue("pnl", null);
    }
  }, [entryPrice, exitPrice, size, direction, form, currentPnL])

  async function onSubmit(data: TradeFormValues) {
    setIsLoading(true)
    let result

    if (trade) {
      result = await updateTrade(trade.id, data)
    } else {
      result = await createTrade(data)
    }

    setIsLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(trade ? "Operación actualizada" : "Operación registrada")
      if (onSuccess) onSuccess()
      if (!trade) {
        form.reset({
          ...form.getValues(), // Keep some values? No, reset all.
          symbol: "",
          entry_price: undefined,
          exit_price: null,
          size: undefined,
          pnl: null,
          notes: "",
          mood: undefined,
          emotions: [],
          // Keep account_id
          account_id: form.getValues("account_id")
        })
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <FormField
          control={form.control}
          name="account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cuenta</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Símbolo</FormLabel>
                <FormControl>
                  <Input placeholder="EURUSD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LONG">Long (Compra)</SelectItem>
                    <SelectItem value="SHORT">Short (Venta)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="entry_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Entrada</FormLabel>
                <FormControl>
                  <Input type="number" step="0.00001" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamaño (Lotes/Unidades)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="exit_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Salida</FormLabel>
                <FormControl>
                  <Input type="number" step="0.00001" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pnl"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Ganancia / Pérdida (P/L)</FormLabel>
                  {field.value !== undefined && field.value !== null && (
                    <Badge variant={Number(field.value) > 0 ? "default" : Number(field.value) < 0 ? "destructive" : "secondary"} className={Number(field.value) > 0 ? "bg-green-500 hover:bg-green-600" : ""}>
                      {Number(field.value) > 0 ? (
                        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> WIN</span>
                      ) : Number(field.value) < 0 ? (
                        <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3" /> LOSS</span>
                      ) : (
                        "BE"
                      )}
                    </Badge>
                  )}
                </div>
                <FormControl>
                  <Input type="number" step="0.01" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="OPEN">Abierta</SelectItem>
                  <SelectItem value="CLOSED">Cerrada</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
          <h3 className="font-semibold mb-2">Psicotrading</h3>
          <FormField
            control={form.control}
            name="mood"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <EmotionSelector
                    value={form.watch("emotions") || []}
                    onChange={(val) => form.setValue("emotions", val)}
                    moodValue={field.value}
                    onMoodChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea placeholder="Estrategia, emociones, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {trade ? "Actualizar" : "Registrar"}
        </Button>
      </form>
    </Form>
  )
}
