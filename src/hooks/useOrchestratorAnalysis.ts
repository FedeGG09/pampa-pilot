import { useCallback, useState } from 'react'
import { analyzeOrchestrator, isApiError } from '@/lib/api'
import type { OrchestratorAnalyzeRequest, OrchestratorAnalyzeResponse } from '@/types/api'

export function useOrchestratorAnalysis() {
  const [data, setData] = useState<OrchestratorAnalyzeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (input: OrchestratorAnalyzeRequest) => {
    setLoading(true)
    setError(null)

    try {
      const result = await analyzeOrchestrator(input)
      setData(result)
      return result
    } catch (err) {
      setData(null)
      setError(isApiError(err) ? err.message : 'No se pudo analizar el lote.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, run, setData }
}