"use client"

import { useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trade } from "@/features/trades/types"

interface DrawdownChartProps {
  trades: Trade[]
}

export function DrawdownChart({ trades }: DrawdownChartProps) {
  const data = useMemo(() => {
    const closedTrades = trades
      .filter((t) => t.status === "CLOSED" && t.pnl !== null)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    let runningEquity = 0
    let peakEquity = 0
    const points = []

    if (closedTrades.length > 0) {
      points.push({ date: new Date(closedTrades[0].created_at).toLocaleDateString(), drawdown: 0 })
    }

    closedTrades.forEach(trade => {
      runningEquity += trade.pnl || 0
      if (runningEquity > peakEquity) peakEquity = runningEquity
      const drawdown = runningEquity - peakEquity
      points.push({
        date: new Date(trade.created_at).toLocaleDateString(),
        drawdown: Number(drawdown.toFixed(2))
      })
    })

    return points
  }, [trades])

  if (data.length === 0) return null

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Drawdown</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Drawdown
                            </span>
                            <span className="font-bold text-red-500">
                              ${payload[0].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
