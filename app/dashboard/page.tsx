import { TradeList } from "@/features/trades/components/TradeList"
import { TradeForm } from "@/features/trades/components/TradeForm"
import { AnalyticsDashboard } from "@/features/analytics/components/AnalyticsDashboard"
import { AccountSelector } from "@/features/accounts/components/AccountSelector"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams
  const accountId = params.account as string | undefined

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Trading Dashboard</h1>

        <div className="flex items-center gap-4">
          <AccountSelector />
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Operación
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Registrar Operación</DialogTitle>
                <DialogDescription>
                  Ingresa los detalles de tu operación aquí.
                </DialogDescription>
              </DialogHeader>
              <TradeForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <AnalyticsDashboard accountId={accountId} />

      <h2 className="text-2xl font-bold mb-4 mt-8">Historial de Operaciones</h2>
      <TradeList accountId={accountId} />
    </div>
  )
}
