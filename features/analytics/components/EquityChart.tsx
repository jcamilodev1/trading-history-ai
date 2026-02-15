"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateEquityCurve, EquityPoint } from "../utils/analytics-helpers"
import { Trade } from "@/features/trades/types"

interface EquityChartProps {
  trades: Trade[]
}

export function EquityChart({ trades }: EquityChartProps) {
  const data = useMemo(() => calculateEquityCurve(trades), [trades])

  if (data.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Curva de Equity</CardTitle>
        </CardHeader>
        <CardContent className="pl-2 flex items-center justify-center h-[350px] text-muted-foreground">
          No hay datos suficientes para mostrar el gráfico.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Curva de Equity</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
                              Equity
                            </span>
                            <span className="font-bold text-muted-foreground">
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
              <Line
                type="monotone"
                dataKey="equity"
                strokeWidth={2}
                activeDot={{
                  r: 6,
                  style: { fill: "var(--theme-primary)", opacity: 0.8 },
                }}
                className="stroke-primary"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
