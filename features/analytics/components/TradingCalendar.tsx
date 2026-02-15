"use client"

import { useState, useMemo } from "react"
import {
  format,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trade } from "@/features/trades/types"
import { cn } from "@/lib/utils"

interface TradingCalendarProps {
  trades: Trade[]
}

export function TradingCalendar({ trades }: TradingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const goToToday = () => setCurrentMonth(new Date())

  const { days, weeklyStats, monthlyPnL, dailyData } = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    // Aggregate trades by date
    const dailyData: Record<string, { pnl: number; count: number }> = {}
    let monthPnL = 0

    trades.forEach((trade) => {
      if (trade.status !== "CLOSED" || !trade.pnl) return
      const dateStr = format(new Date(trade.created_at), "yyyy-MM-dd")

      if (!dailyData[dateStr]) dailyData[dateStr] = { pnl: 0, count: 0 }
      dailyData[dateStr].pnl += trade.pnl
      dailyData[dateStr].count += 1

      if (isSameMonth(new Date(trade.created_at), currentMonth)) {
        monthPnL += trade.pnl
      }
    })

    // Calculate weekly stats
    const weeks: Date[][] = []
    let currentWeek: Date[] = []

    days.forEach(day => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })

    const wStats = weeks.map(week => {
      let wPnL = 0
      let wCount = 0
      week.forEach(day => {
        const dateStr = format(day, "yyyy-MM-dd")
        if (dailyData[dateStr]) {
          wPnL += dailyData[dateStr].pnl
          wCount += dailyData[dateStr].count
        }
      })
      return { pnl: wPnL, count: wCount }
    })


    return { days, weeklyStats: wStats, monthlyPnL: monthPnL, dailyData }
  }, [currentMonth, trades])

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-xl font-bold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </CardTitle>
          <span className={cn(
            "text-sm font-medium px-2 py-1 rounded",
            monthlyPnL > 0 ? "text-green-500 bg-green-500/10" : monthlyPnL < 0 ? "text-red-500 bg-red-500/10" : "text-muted-foreground"
          )}>
            Total: ${monthlyPnL.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-px bg-muted/20 border rounded-md overflow-hidden">
          {/* Header */}
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Resumen"].map((day) => (
            <div key={day} className="bg-muted text-muted-foreground p-2 text-center text-xs font-medium uppercase">
              {day}
            </div>
          ))}

          {/* Render by weeks to handle 8th column */}
          {(() => {
            const rows = []
            for (let i = 0; i < days.length; i += 7) {
              const weekDays = days.slice(i, i + 7)
              const weekIndex = i / 7
              const stats = weeklyStats[weekIndex]

              // Render 7 days
              weekDays.forEach((day) => {
                const dateStr = format(day, "yyyy-MM-dd")
                const data = (dailyData as any)[dateStr]
                const isCurrentMonth = isSameMonth(day, currentMonth)

                rows.push(
                  <div
                    key={day.toString()}
                    className={cn(
                      "min-h-[100px] p-2 border-t border-r relative flex flex-col justify-between transition-colors hover:bg-muted/10",
                      !isCurrentMonth && "bg-muted/5 text-muted-foreground/50",
                      isToday(day) && "bg-accent/5 ring-1 ring-inset ring-primary"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-semibold",
                      !isCurrentMonth && "opacity-50"
                    )}>
                      {format(day, "d")}
                    </span>

                    {data && (
                      <div className="flex flex-col items-end mt-auto space-y-1">
                        <span className={cn(
                          "text-sm font-bold",
                          data.pnl > 0 ? "text-green-500" : data.pnl < 0 ? "text-red-500" : "text-gray-500"
                        )}>
                          ${data.pnl.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {data.count} trades
                        </span>
                      </div>
                    )}
                  </div>
                )
              })

              // Render Week Summary Column (8th column)
              rows.push(
                <div key={`week-${weekIndex}`} className="min-h-[100px] p-2 border-t bg-muted/5 flex flex-col justify-center items-end">
                  <div className="text-xs text-muted-foreground mb-2">Semana {weekIndex + 1}</div>
                  <span className={cn(
                    "text-sm font-bold",
                    stats?.pnl > 0 ? "text-green-500" : stats?.pnl < 0 ? "text-red-500" : "text-gray-500"
                  )}>
                    ${stats?.pnl.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {stats?.count} trades
                  </span>
                </div>
              )
            }
            return rows
          })()}
        </div>
      </CardContent>
    </Card>
  )
}
