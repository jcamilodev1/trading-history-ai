"use client"

import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, LayoutGrid, PlusCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAccountStore } from "../stores/useAccountStore"
import { getAccounts } from "../actions"
import { CreateAccountDialog } from "./CreateAccountDialog"
import { toast } from "sonner"

export function AccountSelector() {
  const [open, setOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const currentAccountId = searchParams.get("account") || "ALL"

  const accounts = useAccountStore((state) => state.accounts)
  const setAccounts = useAccountStore((state) => state.setAccounts)
  const setSelectedAccountId = useAccountStore((state) => state.setSelectedAccountId)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAccounts()
        setAccounts(data)
      } catch (error) {
        toast.error("Failed to load accounts")
      }
    }
    fetchAccounts()
  }, [setAccounts])

  // Sync URL with Store (optional, but good for other components)
  useEffect(() => {
    setSelectedAccountId(currentAccountId === "ALL" ? null : currentAccountId)
  }, [currentAccountId, setSelectedAccountId])

  const handleSelect = (accountId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (accountId === "ALL") {
      params.delete("account")
    } else {
      params.set("account", accountId)
    }
    router.push(`?${params.toString()}`)
    setOpen(false)
  }

  const selectedAccount = accounts.find((account) => account.id === currentAccountId)

  const displayName = currentAccountId === "ALL"
    ? "Todas las Cuentas"
    : selectedAccount?.name || "Select account..."

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[250px] justify-between"
          >
            {currentAccountId === "ALL" ? (
              <span className="flex items-center"><LayoutGrid className="mr-2 h-4 w-4" /> Todas las Cuentas</span>
            ) : (
              selectedAccount?.name || "Select account..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Search account..." />
            <CommandList>
              <CommandEmpty>No account found.</CommandEmpty>
              <CommandGroup heading="Vistas">
                <CommandItem
                  onSelect={() => handleSelect("ALL")}
                  className="text-sm cursor-pointer"
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Todas las Cuentas
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentAccountId === "ALL" ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Cuentas">
                {accounts.map((account) => (
                  <CommandItem
                    key={account.id}
                    onSelect={() => handleSelect(account.id)}
                    className="text-sm cursor-pointer"
                  >
                    {account.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        currentAccountId === account.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    setShowCreateDialog(true)
                  }}
                  className="cursor-pointer text-sm font-medium text-primary"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Nueva Cuenta
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <CreateAccountDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          getAccounts().then(setAccounts)
        }}
      />
    </>
  )
}
