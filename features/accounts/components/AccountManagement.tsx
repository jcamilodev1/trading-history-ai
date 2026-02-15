"use client"

import { useState } from "react"
import { Pencil, Trash2, Plus, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAccountStore } from "../stores/useAccountStore"
import { updateAccount, deleteAccount, getAccounts } from "../actions"
import { AccountForm, AccountFormValues } from "./AccountForm"
import { CreateAccountDialog } from "./CreateAccountDialog"
import { Account } from "../types"

export function AccountManagement() {
  const accounts = useAccountStore((state) => state.accounts)
  const setAccounts = useAccountStore((state) => state.setAccounts)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const handleUpdate = async (data: AccountFormValues) => {
    if (!editingAccount) return
    try {
      const result = await updateAccount(editingAccount.id, data)
      if (result.error) {
        toast.error(`Error: ${result.error}`)
        return
      }
      toast.success("Cuenta actualizada")
      const updated = await getAccounts()
      setAccounts(updated)
      setEditingAccount(null)
    } catch (error) {
      toast.error("Error al actualizar la cuenta")
    }
  }

  const handleDelete = async () => {
    if (!deletingAccountId) return
    try {
      const result = await deleteAccount(deletingAccountId)
      if (result.error) {
        toast.error(`Error: ${result.error}`)
        return
      }
      toast.success("Cuenta eliminada")
      const updated = await getAccounts()
      setAccounts(updated)
      setDeletingAccountId(null)
    } catch (error) {
      toast.error("Error al eliminar la cuenta")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mis Cuentas</h2>
          <p className="text-muted-foreground">
            Administra tus cuentas de trading conectadas.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Cuenta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id} className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => setEditingAccount(account)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => setDeletingAccountId(account.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{account.name}</CardTitle>
                <CardDescription>{account.broker || "Sin broker"}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Divisa:</span>
                  <span className="text-foreground font-medium uppercase">{account.currency}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>MT5 ID:</span>
                  <span className="text-foreground font-medium">{account.mt5_login || "No conectado"}</span>
                </div>
                {account.is_default && (
                  <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground">
                    Principal
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {accounts.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg">
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No hay cuentas</h3>
            <p className="text-muted-foreground">Empieza creando tu primera cuenta de trading.</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Crear Cuenta
            </Button>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={(open: boolean) => !open && setEditingAccount(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Cuenta</DialogTitle>
            <DialogDescription>
              Modifica los detalles de tu cuenta de trading.
            </DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <AccountForm
              initialData={editingAccount}
              onSubmit={handleUpdate}
              onCancel={() => setEditingAccount(null)}
              submitLabel="Actualizar Cuenta"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingAccountId} onOpenChange={(open) => !open && setDeletingAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán permanentemente los datos de esta cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateAccountDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
