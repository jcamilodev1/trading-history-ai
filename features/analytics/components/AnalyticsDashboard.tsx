import { createClient } from '@/lib/supabase/server'
import { StatsCards } from './StatsCards'
import { EquityChart } from './EquityChart'
import { TradesHeatmap } from './TradesHeatmap'
import { DrawdownChart } from './DrawdownChart'
import { TradingCalendar } from './TradingCalendar'
import { calculateMetrics } from '../utils/analytics-helpers'
import { Trade } from '@/features/trades/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AnalyticsDashboardProps {
  accountId?: string
}

export async function AnalyticsDashboard({ accountId }: AnalyticsDashboardProps) {
  const supabase = await createClient()

  // Fetch all trades (closed)
  let query = supabase
    .from('trades')
    .select('*')
    .order('created_at', { ascending: true })

  if (accountId && accountId !== "ALL") {
    query = query.eq('account_id', accountId)
  }

  const { data: trades, error } = await query

  if (error || !trades) {
    return <div>Error loading analytics</div>
  }

  const closedTrades = (trades as Trade[]).filter(t => t.status === "CLOSED")
  const metrics = calculateMetrics(closedTrades)

  return (
    <div className="space-y-4 mb-8">
      <StatsCards metrics={metrics} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <EquityChart trades={trades as Trade[]} />
        <TradesHeatmap trades={trades as Trade[]} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <DrawdownChart trades={trades as Trade[]} />
        <TradingCalendar trades={trades as Trade[]} />
      </div>
    </div>
  )
}
