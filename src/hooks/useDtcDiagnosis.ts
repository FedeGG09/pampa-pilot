import { useCallback, useState } from 'react'
import { diagnoseDtc, isApiError } from '@/lib/api'
import type { DtcDiagnosisRequest, DtcDiagnosisResponse } from '@/types/api'

export function useDtcDiagnosis() {
  const [data, setData] = useState<DtcDiagnosisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (input: DtcDiagnosisRequest) => {
    setLoading(true)
    setError(null)

    try {
      const result = await diagnoseDtc(input)
      setData(result)
      return result
    } catch (err) {
      setData(null)
      setError(
        isApiError(err) ? err.message : 'No se pudo diagnosticar el código DTC.',
      )
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, run, setData }
}