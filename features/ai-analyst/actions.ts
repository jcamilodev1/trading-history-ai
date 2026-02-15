'use server'

import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIAnalysisResult } from './types'

export async function getAIAnalysis(): Promise<AIAnalysisResult> {
  try {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { isError: true, errorMessage: 'Usuario no autenticado' }
    }

    // 2. Fetch Trades (Last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: trades, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching trades:', error)
      return { isError: true, errorMessage: 'Error al obtener las operaciones' }
    }

    if (!trades || trades.length === 0) {
      return {
        data: {
          summary: 'No se encontraron operaciones en los últimos 30 días para analizar.',
          strengths: [],
          weaknesses: [],
          tips: []
        },
        isError: false
      }
    }

    // 3. Format Trades for AI
    const tradesCSV = trades.map(t =>
      `${t.created_at.split('T')[0]},${t.symbol},${t.direction},${t.status},${t.pnl?.toFixed(2) || '0'},${t.entry_price},${t.exit_price || ''}`
    ).join('\n')

    const prompt = `
      Actúa como un mentor experto en trading institucional y análisis cuantitativo.
      Analiza el siguiente historial de operaciones de los últimos 30 días.
      
      Formato de datos (CSV): Fecha, Simbolo, Dirección, Estado, PnL, Entrada, Salida
      
      --- DATOS ---
      ${tradesCSV}
      --- FIN DATOS ---

      Provee un análisis estructurado en formato JSON. NO uses markdown.
      El JSON debe tener EXACTAMENTE esta estructura:
      {
        "summary": "Un párrafo resumen del rendimiento general (máximo 200 caracteres).",
        "strengths": ["Fortaleza 1 detectada", "Fortaleza 2 detectada", "Fortaleza 3 detectada"],
        "weaknesses": ["Debilidad 1 (error recurrente)", "Debilidad 2 (patrón negativo)", "Debilidad 3"],
        "tips": ["Consejo accionable 1", "Consejo accionable 2", "Consejo accionable 3"]
      }

      Sé directo, constructivo y profesional.
    `

    // 4. Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return { isError: true, errorMessage: 'Configuración de IA no encontrada (API Key missing)' }
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" }
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    try {
      const data = JSON.parse(text)
      return { data }
    } catch (e) {
      console.error("Error parsing JSON from AI", text)
      return { isError: true, errorMessage: 'Error al procesar la respuesta de la IA' }
    }

  } catch (error: any) {
    console.error('AI Analysis Error:', error)
    return { isError: true, errorMessage: error.message || 'Error desconocido al generar el análisis' }
  }
}
