import type {
  DashboardOverviewResponse,
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

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'https://fedegg09-pampa-pilot-api.hf.space'
).replace(/\/+$/, '')

async function request<TResponse>(
  path: string,
  init: RequestInit = {},
): Promise<TResponse> {
  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), 45_000)

  try {
    const { headers, body, ...rest } = init

    const requestInit: RequestInit = {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(headers ?? {}),
      },
      signal: controller.signal,
    }

    if (body !== undefined) {
      requestInit.body = body
    }

    const response = await fetch(`${BASE_URL}${path}`, requestInit)

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
    globalThis.clearTimeout(timeout)
  }
}

export function getApiBaseUrl(): string {
  return BASE_URL
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export const apiClient = {
  get<TResponse>(path: string, init?: RequestInit) {
    return request<TResponse>(path, { ...init, method: 'GET' })
  },

  post<TResponse, TBody extends Record<string, unknown> = Record<string, unknown>>(
    path: string,
    body: TBody,
    init?: RequestInit,
  ) {
    return request<TResponse>(path, {
      ...init,
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  put<TResponse, TBody extends Record<string, unknown> = Record<string, unknown>>(
    path: string,
    body: TBody,
    init?: RequestInit,
  ) {
    return request<TResponse>(path, {
      ...init,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },

  del<TResponse>(path: string, init?: RequestInit) {
    return request<TResponse>(path, { ...init, method: 'DELETE' })
  },
}

export async function fetchDashboardOverview(): Promise<DashboardOverviewResponse> {
  return request<DashboardOverviewResponse>('/dashboard/overview', {
    method: 'GET',
  })
}

export async function diagnoseDtc(
  input: DtcDiagnosisRequest,
): Promise<DtcDiagnosisResponse> {
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