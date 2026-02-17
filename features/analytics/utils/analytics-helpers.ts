import { Trade } from "@/features/trades/types"

export interface AnalyticsMetrics {
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  profitFactor: number
  netProfit: number
  averageWin: number
  averageLoss: number
  maxDrawdown: number
  bestTrade: number
  worstTrade: number
  longsWon: number
  shortsWon: number
}

export interface SymbolMetric {
  symbol: string
  totalTrades: number
  winRate: number
  netProfit: number
  wins: number
  losses: number
}

export interface EquityPoint {
  date: string
  equity: number
  pnl: number
}

export function calculateMetrics(trades: Trade[]): AnalyticsMetrics {
  const closedTrades = trades.filter((t) => t.status === "CLOSED" && t.pnl !== null && t.pnl !== undefined)
  const totalTrades = closedTrades.length

  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      profitFactor: 0,
      netProfit: 0,
      averageWin: 0,
      averageLoss: 0,
      maxDrawdown: 0,
      bestTrade: 0,
      worstTrade: 0,
      longsWon: 0,
      shortsWon: 0
    }
  }

  let wins = 0
  let losses = 0
  let grossProfit = 0
  let grossLoss = 0
  let netProfit = 0
  let maxDrawdown = 0
  let currentDrawdown = 0
  let peakEquity = 0
  let runningEquity = 0
  let bestTrade = -Infinity
  let worstTrade = Infinity
  let longsWon = 0
  let shortsWon = 0

  // Sort by date ascending for equity curve calculation
  const sortedTrades = [...closedTrades].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  sortedTrades.forEach((trade) => {
    const pnl = trade.pnl || 0
    netProfit += pnl
    runningEquity += pnl

    if (pnl > 0) {
      wins++
      grossProfit += pnl
      bestTrade = Math.max(bestTrade, pnl)
      if (trade.direction === 'LONG') longsWon++
      else shortsWon++
    } else if (pnl < 0) {
      losses++
      grossLoss += Math.abs(pnl)
      worstTrade = Math.min(worstTrade, pnl)
    }

    // Drawdown calculation
    if (runningEquity > peakEquity) {
      peakEquity = runningEquity
      currentDrawdown = 0
    } else {
      currentDrawdown = peakEquity - runningEquity
      maxDrawdown = Math.max(maxDrawdown, currentDrawdown)
    }
  })

  // Avoid division by zero
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0
  const averageWin = wins > 0 ? grossProfit / wins : 0
  const averageLoss = losses > 0 ? grossLoss / losses : 0

  return {
    totalTrades,
    wins,
    losses,
    winRate,
    profitFactor,
    netProfit,
    averageWin,
    averageLoss,
    maxDrawdown,
    bestTrade: bestTrade === -Infinity ? 0 : bestTrade,
    worstTrade: worstTrade === Infinity ? 0 : worstTrade,
    longsWon,
    shortsWon
  }
}

export function calculateEquityCurve(trades: Trade[]): EquityPoint[] {
  const closedTrades = trades
    .filter((t) => t.status === "CLOSED" && t.pnl !== null)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  let runningEquity = 0
  const curve: EquityPoint[] = []

  // Add initial point
  if (closedTrades.length > 0) {
    curve.push({
      date: new Date(closedTrades[0].created_at).toLocaleDateString(),
      equity: 0,
      pnl: 0
    })
  }

  closedTrades.forEach((trade) => {
    runningEquity += trade.pnl || 0
    curve.push({
      date: new Date(trade.created_at).toLocaleDateString(),
      equity: Number(runningEquity.toFixed(2)),
      pnl: trade.pnl || 0
    })
  })

  return curve
}

export function calculateSymbolStats(trades: Trade[]): SymbolMetric[] {
  const closedTrades = trades.filter((t) => t.status === "CLOSED" && t.pnl !== null && t.pnl !== undefined)
  const symbolMap = new Map<string, { wins: number, total: number, pnl: number, losses: number }>()

  closedTrades.forEach((trade) => {
    const symbol = trade.symbol
    const stats = symbolMap.get(symbol) || { wins: 0, total: 0, pnl: 0, losses: 0 }

    stats.total++
    stats.pnl += trade.pnl || 0
    if ((trade.pnl || 0) > 0) {
      stats.wins++
    } else if ((trade.pnl || 0) < 0) {
      stats.losses++
    }

    symbolMap.set(symbol, stats)
  })

  return Array.from(symbolMap.entries()).map(([symbol, stats]) => ({
    symbol,
    totalTrades: stats.total,
    wins: stats.wins,
    losses: stats.losses,
    netProfit: Number(stats.pnl.toFixed(2)),
    winRate: (stats.wins / stats.total) * 100
  })).sort((a, b) => b.totalTrades - a.totalTrades)
}
