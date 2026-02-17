'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react"
import { getAIAnalysis } from '../actions'
import { AIAnalysisData, AIAnalysisResult } from '../types'
import { getAccounts } from '@/features/accounts/actions'
import { Account } from '@/features/accounts/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from 'react'

export function AnalystDashboard() {
  const [analysis, setAnalysis] = useState<AIAnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL')

  useEffect(() => {
    const fetchAccounts = async () => {
      const data = await getAccounts()
      setAccounts(data)
    }
    fetchAccounts()
  }, [])

  const handleAnalyze = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result: AIAnalysisResult = await getAIAnalysis(selectedAccountId)

      if (result.isError) {
        setError(result.errorMessage || 'Error desconocido')
      } else if (result.data) {
        setAnalysis(result.data)
      }
    } catch (err) {
      setError('Error de conexión con el servicio de IA')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2 text-primary">
            <Sparkles className="h-8 w-8 text-indigo-500" />
            AI Trading Analyst
          </h2>
          <p className="text-muted-foreground mt-1">
            Obtén un diagnóstico profesional de tu operativa reciente impulsado por Gemini.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full sm:w-[200px] bg-background">
              <SelectValue placeholder="Seleccionar Cuenta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las cuentas</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analizando Mercado...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generar Nuevo Análisis
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {!analysis && !isLoading && !error && (
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Tu Mentor o Analista Personal</h3>
            <p className="text-muted-foreground max-w-md">
              Analizaremos tus últimas operaciones para identificar patrones, fortalezas y áreas críticas de mejora.
            </p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Summary Card - Spans full width */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-indigo-500/20 bg-indigo-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="h-5 w-5" />
                Resumen Ejecutivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed font-medium text-foreground/90">
                {analysis.summary}
              </p>
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card className="border-emerald-500/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 text-lg">
                <CheckCircle2 className="h-5 w-5" />
                Fortalezas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.strengths.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card className="border-rose-500/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-500 text-lg">
                <AlertTriangle className="h-5 w-5" />
                Áreas de Mejora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.weaknesses.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-amber-500/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-lg">
                <Lightbulb className="h-5 w-5" />
                Consejos Accionables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.tips.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  )
}
