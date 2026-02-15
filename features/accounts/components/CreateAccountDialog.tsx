"use client"

import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createAccount } from "../actions"
import { useAccountStore } from "../stores/useAccountStore"
import { AccountForm, AccountFormValues } from "./AccountForm"

export interface CreateAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateAccountDialog({ open, onOpenChange, onSuccess }: CreateAccountDialogProps) {
  const setAccounts = useAccountStore(state => state.setAccounts)
  const accounts = useAccountStore(state => state.accounts)

  async function onSubmit(data: AccountFormValues) {
    try {
      const result = await createAccount(data)

      if (result.error) {
        toast.error(`Error: ${result.error}`)
        return
      }

      const newAccount = result.data!
      setAccounts([...accounts, newAccount])
      toast.success("Cuenta creada exitosamente")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error("Ocurrió un error inesperado")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Cuenta de Trading</DialogTitle>
          <DialogDescription>
            Añade una nueva cuenta para rastrear tus operaciones por separado.
          </DialogDescription>
        </DialogHeader>
        <AccountForm onSubmit={onSubmit} onCancel={() => onOpenChange(false)} submitLabel="Crear Cuenta" />
      </DialogContent>
    </Dialog>
  )
}
