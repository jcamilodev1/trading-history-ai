import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trade } from '@/features/trades/types'
import { Badge } from '@/components/ui/badge'
import { Smile, Meh, Frown, Angry, Zap, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const MOOD_ICONS: Record<string, any> = {
  happy: { icon: Smile, color: "text-green-500" },
  neutral: { icon: Meh, color: "text-gray-500" },
  sad: { icon: Frown, color: "text-blue-500" },
  angry: { icon: Angry, color: "text-red-500" },
  excited: { icon: Zap, color: "text-yellow-500" },
}

interface TradeListProps {
  accountId?: string
  page?: number
  pageSize?: number
}

export async function TradeList({
  accountId,
  page = 1,
  pageSize = 10
}: TradeListProps) {
  const supabase = await createClient()

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('trades')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (accountId && accountId !== "ALL") {
    query = query.eq('account_id', accountId)
  }

  const { data: trades, error, count } = await query

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded-md">
        Error al cargar operaciones: {error.message}
      </div>
    )
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0

  if (!trades || trades.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No hay operaciones registradas aún.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Símbolo</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>P Entrada</TableHead>
            <TableHead>P Salida</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>P/L</TableHead>
            <TableHead>Psico</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(trades as Trade[]).map((trade) => {
            const MoodIcon = trade.mood ? MOOD_ICONS[trade.mood]?.icon : null
            const moodColor = trade.mood ? MOOD_ICONS[trade.mood]?.color : ""

            return (
              <TableRow key={trade.id}>
                <TableCell>
                  {new Date(trade.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium">{trade.symbol}</TableCell>
                <TableCell>
                  <Badge variant={trade.direction === 'LONG' ? 'default' : 'secondary'}>
                    {trade.direction}
                  </Badge>
                </TableCell>
                <TableCell>{trade.entry_price}</TableCell>
                <TableCell>{trade.exit_price || '-'}</TableCell>
                <TableCell>{trade.size}</TableCell>
                <TableCell className={
                  trade.pnl && trade.pnl > 0 ? "text-green-600 font-bold" :
                    trade.pnl && trade.pnl < 0 ? "text-red-600 font-bold" : ""
                }>
                  {trade.pnl ? trade.pnl.toFixed(2) : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {MoodIcon && <MoodIcon className={`h-5 w-5 ${moodColor}`} />}
                    <div className="flex flex-wrap gap-1">
                      {trade.emotions?.map(e => (
                        <Badge key={e} variant="outline" className="text-[10px] px-1 py-0 h-4">{e}</Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={trade.status === 'OPEN' ? 'outline' : 'secondary'}>
                    {trade.status}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando {from + 1} a {Math.min(from + (trades?.length || 0), count || 0)} de {count} operaciones
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={page <= 1}
            >
              <Link
                href={{
                  query: {
                    ...(accountId ? { account: accountId } : {}),
                    page: page - 1
                  },
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                scroll={false}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Link>
            </Button>
            <div className="text-sm font-medium">
              Página {page} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={page >= totalPages}
            >
              <Link
                href={{
                  query: {
                    ...(accountId ? { account: accountId } : {}),
                    page: page + 1
                  },
                }}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                scroll={false}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
