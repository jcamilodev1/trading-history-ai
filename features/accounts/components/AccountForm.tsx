"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Account, CreateAccountDTO } from "../types"

export const accountSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  broker: z.string().optional().nullable(),
  currency: z.string().default("USD"),
  is_default: z.boolean().default(false),
  mt5_login: z.preprocess(
    (val) => (val === "" || val === null ? undefined : Number(val)),
    z.number().optional()
  ),
  mt5_password: z.string().optional().nullable(),
  mt5_server: z.string().optional().nullable(),
})

export type AccountFormValues = z.infer<typeof accountSchema>

interface AccountFormProps {
  initialData?: Account
  onSubmit: (data: AccountFormValues) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export function AccountForm({ initialData, onSubmit, onCancel, submitLabel = "Guardar" }: AccountFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      broker: initialData?.broker || "",
      currency: initialData?.currency || "USD",
      is_default: initialData?.is_default || false,
      mt5_login: initialData?.mt5_login || undefined,
      mt5_password: initialData?.mt5_password || "",
      mt5_server: initialData?.mt5_server || "",
    },
  })

  const handleSubmit = async (data: AccountFormValues) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Cuenta</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Mi cuenta de fondeo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="broker"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Broker (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: MavenTrade, FTMO" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="mt5_login"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MT5 Login ID (Opcional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="12345678" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mt5_server"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MT5 Server (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="MetaQuotes-Demo" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="mt5_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>MT5 Password (Opcional)</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Establecer como predeterminada
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
