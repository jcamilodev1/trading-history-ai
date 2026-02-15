import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsMetrics } from "../utils/analytics-helpers"
import { TrendingUp, TrendingDown, Activity, DollarSign, Percent } from "lucide-react"

interface StatsCardsProps {
  metrics: AnalyticsMetrics
}

export function StatsCards({ metrics }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Beneficio Neto
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${metrics.netProfit.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.totalTrades} operaciones cerradas
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Win Rate
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.winRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.wins} ganadas / {metrics.losses} perdidas
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.profitFactor.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Gross Profit / Gross Loss
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Max Drawdown
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            ${metrics.maxDrawdown.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Máxima caída del equity
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
