import { getApiBaseUrl } from '@/lib/api'

export interface AgronomistChatRequest {
  message: string
}

export interface AgronomistChatResponse {
  reply?: string
  answer?: string
  message?: string
  content?: string
  data?: {
    reply?: string
    answer?: string
    message?: string
    content?: string
  }
}

export class AgronomistChatError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AgronomistChatError'
  }
}

function resolveReply(payload: unknown): string {
  if (typeof payload === 'string') return payload.trim()
  if (!payload || typeof payload !== 'object') return ''

  const record = payload as Record<string, unknown>
  const candidates = [
    record.reply,
    record.answer,
    record.message,
    record.content,
    record.response,
    typeof record.data === 'object' && record.data
      ? (record.data as Record<string, unknown>).reply ??
        (record.data as Record<string, unknown>).answer ??
        (record.data as Record<string, unknown>).message ??
        (record.data as Record<string, unknown>).content ??
        (record.data as Record<string, unknown>).response
      : undefined,
  ]

  const candidate = candidates.find((value) => typeof value === 'string' && value.trim().length > 0)
  return typeof candidate === 'string' ? candidate.trim() : ''
}

export async function sendAgronomistChat(
  request: AgronomistChatRequest,
  signal?: AbortSignal,
): Promise<{ reply: string; raw: unknown }> {
  const baseUrl = getApiBaseUrl().replace(/\/+$/, '')
  const controller = signal ? null : new AbortController()
  const activeSignal = signal ?? controller!.signal
  const timeoutId = window.setTimeout(() => controller?.abort(), 45_000)

  try {
    const response = await fetch(`${baseUrl}/agronomist/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ message: request.message }),
      signal: activeSignal,
    })

    const contentType = response.headers.get('content-type') ?? ''
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null)

    if (!response.ok) {
      const detail =
        payload && typeof payload === 'object' && 'detail' in payload
          ? String((payload as Record<string, unknown>).detail)
          : `HTTP ${response.status}`
      throw new AgronomistChatError(detail, response.status, payload)
    }

    const reply = resolveReply(payload) || 'Pude recibir tu mensaje, pero no encontré una respuesta clara del backend.'
    return { reply, raw: payload }
  } catch (error) {
    if (error instanceof AgronomistChatError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AgronomistChatError('La solicitud superó el tiempo de espera.', 408)
    }
    const message = error instanceof Error ? error.message : 'Error inesperado'
    throw new AgronomistChatError(message, undefined, error)
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export function isAgronomistChatError(error: unknown): error is AgronomistChatError {
  return error instanceof AgronomistChatError
}
