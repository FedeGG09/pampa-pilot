import { useCallback, useState } from 'react'
import { isApiError, simulateFinance } from '@/lib/api'
import type { FinanceSimulationRequest, FinanceSimulationResponse } from '@/types/api'

export function useFinanceSimulation() {
  const [data, setData] = useState<FinanceSimulationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (input: FinanceSimulationRequest) => {
    setLoading(true)
    setError(null)

    try {
      const result = await simulateFinance(input)
      setData(result)
      return result
    } catch (err) {
      setData(null)
      setError(
        isApiError(err) ? err.message : 'No se pudo ejecutar la simulación financiera.',
      )
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, run, setData }
}