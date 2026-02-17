import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SymbolMetric } from "../utils/analytics-helpers"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"

interface SymbolStatsProps {
  stats: SymbolMetric[]
}

export function SymbolStats({ stats }: SymbolStatsProps) {
  const topStats = stats.slice(0, 5)

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Rendimiento por Activo (Top 5)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No hay datos suficientes</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {topStats.map((item) => (
                <div key={item.symbol} className="p-4 rounded-xl border bg-muted/30 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">{item.symbol}</span>
                    <Badge variant={item.netProfit >= 0 ? "default" : "destructive"} className={item.netProfit >= 0 ? "bg-green-500/10 text-green-600 border-green-200" : ""}>
                      {item.netProfit >= 0 ? "+" : ""}{item.netProfit.toFixed(2)}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Winrate</span>
                      <span>{item.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.winRate >= 50 ? 'bg-green-500' : 'bg-orange-500'}`}
                        style={{ width: `${item.winRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="text-muted-foreground">{item.totalTrades} Op.</span>
                    <div className="flex gap-2">
                      <span className="text-green-600 font-medium">{item.wins}W</span>
                      <span className="text-red-600 font-medium">{item.losses}L</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
