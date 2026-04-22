import type {
  DtcDiagnosisRequest,
  DtcDiagnosisResponse,
  FinanceSimulationRequest,
  FinanceSimulationResponse,
  OrchestratorAnalyzeRequest,
  OrchestratorAnalyzeResponse,
} from '@/types/api'

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://fedeGG09-pampa-pilot-api.hf.space').replace(/\/+$/, '')

async function request<TResponse>(path: string, init: RequestInit): Promise<TResponse> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 45_000)

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    })

    const contentType = response.headers.get('content-type') ?? ''
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null)

    if (!response.ok) {
      const message =
        typeof payload === 'object' && payload && 'detail' in payload
          ? String((payload as Record<string, unknown>).detail)
          : `HTTP ${response.status}`
      throw new ApiError(message, response.status, payload)
    }

    return payload as TResponse
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('La solicitud superó el tiempo de espera.', 408)
    }
    const message = error instanceof Error ? error.message : 'Error inesperado'
    throw new ApiError(message, undefined, error)
  } finally {
    window.clearTimeout(timeout)
  }
}

export function getApiBaseUrl(): string {
  return BASE_URL
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export async function diagnoseDtc(input: DtcDiagnosisRequest): Promise<DtcDiagnosisResponse> {
  return request<DtcDiagnosisResponse>('/dtc/diagnose', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function simulateFinance(
  input: FinanceSimulationRequest,
): Promise<FinanceSimulationResponse> {
  return request<FinanceSimulationResponse>('/finance/simulate', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function analyzeOrchestrator(
  input: OrchestratorAnalyzeRequest,
): Promise<OrchestratorAnalyzeResponse> {
  return request<OrchestratorAnalyzeResponse>('/orchestrator/analyze', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
