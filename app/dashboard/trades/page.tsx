import { TradeList } from "@/features/trades/components/TradeList"
import { AccountSelector } from "@/features/accounts/components/AccountSelector"

interface TradesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TradesPage({ searchParams }: TradesPageProps) {
  const params = await searchParams
  const accountId = params.account as string | undefined
  const page = params.page ? parseInt(params.page as string) : 1

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial de Trades</h1>
          <p className="text-muted-foreground">
            Revisa y filtra todas tus operaciones registradas.
          </p>
        </div>
        <AccountSelector />
      </div>

      <TradeList accountId={accountId} page={page} />
    </div>
  )
}
