"use client"

import { useMemo } from "react"
import { format, subYears, eachDayOfInterval, startOfWeek, isSameMonth } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trade } from "@/features/trades/types"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TradesHeatmapProps {
  trades: Trade[]
}

export function TradesHeatmap({ trades }: TradesHeatmapProps) {
  const { grid, months, maxAbsPnL } = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const start = new Date(currentYear, 0, 1) // January 1st
    const end = new Date(currentYear, 11, 31) // December 31st

    // Adjust start to the beginning of that week (Sunday)
    const calendarStart = startOfWeek(start, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: calendarStart, end })

    const dailyData: Record<string, { pnl: number; count: number }> = {}
    let currentMaxAbs = 0

    trades.forEach((trade) => {
      if (trade.status !== "CLOSED" || !trade.pnl) return
      const dateStr = format(new Date(trade.created_at), "yyyy-MM-dd")
      if (!dailyData[dateStr]) dailyData[dateStr] = { pnl: 0, count: 0 }
      dailyData[dateStr].pnl += trade.pnl
      dailyData[dateStr].count += 1
      currentMaxAbs = Math.max(currentMaxAbs, Math.abs(dailyData[dateStr].pnl))
    })

    // Organize into 7 rows (days) x N weeks
    const weeks: any[][] = []
    let currentWeek: any[] = []

    const monthLabels: { label: string; index: number }[] = []
    let lastMonthName = ""

    days.forEach((day, i) => {
      const dateStr = format(day, "yyyy-MM-dd")
      const data = dailyData[dateStr]

      currentWeek.push({
        date: day,
        data: data || { pnl: 0, count: 0 }
      })

      if (currentWeek.length === 7) {
        weeks.push(currentWeek)

        // Month label logic: check the month of the first day of the week
        // We only add the month if it's the first time we see it AND it belongs to the current year
        const dayInWeek = currentWeek[0].date
        const monthName = format(dayInWeek, "MMM", { locale: es })
        const yearOfMidWeek = currentWeek[3].date.getFullYear()

        if (monthName !== lastMonthName && yearOfMidWeek === currentYear) {
          monthLabels.push({ label: monthName, index: weeks.length - 1 })
          lastMonthName = monthName
        }

        currentWeek = []
      }
    })

    // Add remaining days if any
    if (currentWeek.length > 0) weeks.push(currentWeek)

    return { grid: weeks, months: monthLabels, maxAbsPnL: currentMaxAbs }
  }, [trades])

  const getColor = (pnl: number) => {
    if (pnl === 0) return "bg-muted/20"

    // Calculate intensity based on pnl relative to max
    const intensity = Math.min(Math.ceil((Math.abs(pnl) / (maxAbsPnL || 1)) * 4), 4)

    if (pnl > 0) {
      const levels = ["bg-emerald-950/30", "bg-emerald-700/50", "bg-emerald-600", "bg-emerald-500", "bg-emerald-400"]
      return levels[intensity] || levels[0]
    } else {
      const levels = ["bg-rose-950/30", "bg-rose-700/50", "bg-rose-600", "bg-rose-500", "bg-rose-400"]
      return levels[intensity] || levels[0]
    }
  }

  const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Consistencia ({new Date().getFullYear()})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          {/* Month labels */}
          <div className="flex h-4 text-[9px] text-muted-foreground relative mb-1 overflow-hidden">
            {months.map((m, i) => (
              <div
                key={i}
                className="absolute whitespace-nowrap"
                style={{ left: `${(m.index / grid.length) * 100}%` }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {/* Day labels column */}
            <div className="flex flex-col gap-[2px] pr-1 mt-0.5 pointer-events-none">
              {DAY_LABELS.map((d, i) => (
                <div key={i} className="h-2.5 flex items-center justify-end">
                  <span className={cn(
                    "text-[7px] text-muted-foreground font-medium",
                    (i !== 1 && i !== 3 && i !== 5) && "invisible"
                  )}>
                    {d}
                  </span>
                </div>
              ))}
            </div>

            {/* The Grid */}
            <div className="flex flex-1 gap-[2px]">
              <TooltipProvider delayDuration={0}>
                {grid.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[2px] min-w-[10px]">
                    {week.map((dayObj, dayIdx) => (
                      <Tooltip key={dayIdx}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-2.5 h-2.5 rounded-[1px] transition-all hover:ring-1 hover:ring-primary/50 cursor-pointer",
                              getColor(dayObj.data.pnl)
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10px] p-2">
                          <div className="font-bold border-b pb-1 mb-1">{format(dayObj.date, "PP", { locale: es })}</div>
                          <div className="flex justify-between gap-4">
                            <span>Resultado:</span>
                            <span className={cn("font-bold", dayObj.data.pnl >= 0 ? "text-emerald-500" : "text-rose-500")}>
                              ${dayObj.data.pnl.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span>Operaciones:</span>
                            <span>{dayObj.data.count}</span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </TooltipProvider>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-2 text-[9px] text-muted-foreground self-end">
            <span>Pérdida</span>
            <div className="flex gap-[1px]">
              <div className="w-2 h-2 rounded-[1px] bg-rose-600" />
              <div className="w-2 h-2 rounded-[1px] bg-rose-400" />
              <div className="w-2 h-2 rounded-[1px] bg-muted/20" />
              <div className="w-2 h-2 rounded-[1px] bg-emerald-400" />
              <div className="w-2 h-2 rounded-[1px] bg-emerald-600" />
            </div>
            <span>Ganancia</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
