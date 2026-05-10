import type {
  AgronomistChatResponse,
  ConversationDetailResponse,
  ConversationSearchResponse,
  DtcDiagnosisRequest,
  DtcDiagnosisResponse,
  FinanceSimulationRequest,
  FinanceSimulationResponse,
  OrchestratorAnalyzeRequest,
  OrchestratorAnalyzeResponse,
  SupervisorChatRequest,
  SupervisorChatResponse,
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

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://fedegg09-pampa-pilot-api.hf.space').replace(/\/+$/, '')

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

  post<TResponse, TBody = unknown>(
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

  put<TResponse, TBody = unknown>(
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

/* Endpoints existentes */

export async function fetchDashboardOverview(): Promise<unknown> {
  return request('/dashboard/overview', {
    method: 'GET',
  })
}

export async function diagnoseDtc(
  input: DtcDiagnosisRequest,
): Promise<DtcDiagnosisResponse> {
  return request('/dtc/diagnose', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function simulateFinance(
  input: FinanceSimulationRequest,
): Promise<FinanceSimulationResponse> {
  return request('/finance/simulate', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function analyzeOrchestrator(
  input: OrchestratorAnalyzeRequest,
): Promise<OrchestratorAnalyzeResponse> {
  return request('/orchestrator/analyze', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/* Chat legacy agrónomo */

export async function sendAgronomistChat(
  message: string,
): Promise<AgronomistChatResponse> {
  return request('/agronomist/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

/* Chat supervisor / multiagente */

export async function sendSupervisorChat(
  input: SupervisorChatRequest,
): Promise<SupervisorChatResponse> {
  return request('/chat', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function fetchChatConversations(
  userId: string,
  query?: string,
): Promise<ConversationSearchResponse> {
  const params = new URLSearchParams()
  params.set('user_id', userId)
  if (query?.trim()) {
    params.set('query', query.trim())
  }

  return request(`/chat/search?${params.toString()}`, {
    method: 'GET',
  })
}

export async function fetchChatConversation(
  threadId: string,
): Promise<ConversationDetailResponse> {
  return request(`/chat/${encodeURIComponent(threadId)}`, {
    method: 'GET',
  })
}