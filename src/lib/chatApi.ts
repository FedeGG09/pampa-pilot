import type {
  AgentId,
  ApiResponse,
  ChatHistoryItem,
  ConversationSearchItem,
  SearchConversationsResponse,
} from '../types/chat';

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'https://fedegg09-pampa-pilot-api.hf.space'
).replace(/\/+$/, '');

const CHAT_ENDPOINT = (
  import.meta.env.VITE_CHAT_ENDPOINT ?? '/chat'
).replace(/\/+$/, '');

const CHAT_SEARCH_ENDPOINT = (
  import.meta.env.VITE_CHAT_SEARCH_ENDPOINT ?? '/chat/search'
).replace(/\/+$/, '');

const AGENT_ENDPOINTS: Record<AgentId, string> = {
  agronomist: (
    import.meta.env.VITE_AGRONOMIST_CHAT_ENDPOINT ?? '/agronomist/chat'
  ).replace(/\/+$/, ''),
  finance: (
    import.meta.env.VITE_FINANCE_CHAT_ENDPOINT ?? '/finance/chat'
  ).replace(/\/+$/, ''),
  machinery: (
    import.meta.env.VITE_MACHINERY_CHAT_ENDPOINT ?? CHAT_ENDPOINT
  ).replace(/\/+$/, ''),
  people_legal: (
    import.meta.env.VITE_PEOPLE_LEGAL_CHAT_ENDPOINT ?? CHAT_ENDPOINT
  ).replace(/\/+$/, ''),
};

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
}

async function request<TResponse>(
  path: string,
  init: RequestInit = {},
): Promise<TResponse> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 45_000);

  try {
    const { headers, body, ...rest } = init;

    const response = await fetch(buildUrl(path), {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(headers ?? {}),
      },
      signal: controller.signal,
      body,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);

    if (!response.ok) {
      const message =
        typeof payload === 'object' && payload && 'detail' in payload
          ? String((payload as Record<string, unknown>).detail)
          : `HTTP ${response.status}`;
      throw new ApiError(message, response.status, payload);
    }

    return payload as TResponse;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('La solicitud superó el tiempo de espera.', 408);
    }

    const message = error instanceof Error ? error.message : 'Error inesperado';
    throw new ApiError(message, undefined, error);
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

function endpointForAgent(agentId: AgentId): string {
  return AGENT_ENDPOINTS[agentId];
}

export function normalizeAgentReply(payload: ApiResponse): string {
  const candidates = [
    payload.reply,
    payload.answer,
    payload.summary,
    payload.recommendation,
    payload.note,
    payload.message,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  if (payload.needs_clarification && payload.clarification_question) {
    return payload.clarification_question;
  }

  return 'No se pudo obtener una respuesta legible del backend.';
}

export interface SendAgentMessageInput {
  agentId: AgentId;
  message: string;
  history: ChatHistoryItem[];
  context?: Record<string, unknown>;
}

export async function sendAgentMessage(
  input: SendAgentMessageInput,
): Promise<ApiResponse> {
  const endpoint = endpointForAgent(input.agentId);

  const payload = {
    agent_id: input.agentId,
    message: input.message,
    history: input.history,
    context: {
      ...(input.context ?? {}),
      agent_id: input.agentId,
    },
  };

  return request<ApiResponse>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface SearchConversationsInput {
  query?: string;
  agentId?: AgentId;
  limit?: number;
  offset?: number;
  extraParams?: Record<string, string | number | boolean | undefined>;
}

function normalizeSearchResults(
  payload: SearchConversationsResponse | ConversationSearchItem[] | unknown,
): ConversationSearchItem[] {
  if (Array.isArray(payload)) return payload;

  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as SearchConversationsResponse;

  if (Array.isArray(obj.results)) return obj.results;
  if (Array.isArray(obj.items)) return obj.items;
  if (Array.isArray(obj.conversations)) return obj.conversations;

  return [];
}

export async function searchConversations(
  input: SearchConversationsInput,
): Promise<ConversationSearchItem[]> {
  const params = new URLSearchParams();

  if (input.query?.trim()) params.set('q', input.query.trim());
  if (input.agentId) params.set('agent_id', input.agentId);
  if (typeof input.limit === 'number') params.set('limit', String(input.limit));
  if (typeof input.offset === 'number') params.set('offset', String(input.offset));

  for (const [key, value] of Object.entries(input.extraParams ?? {})) {
    if (value !== undefined && value !== null && String(value).length > 0) {
      params.set(key, String(value));
    }
  }

  const path = `${CHAT_SEARCH_ENDPOINT}${params.toString() ? `?${params.toString()}` : ''}`;
  const payload = await request<SearchConversationsResponse | ConversationSearchItem[] | unknown>(
    path,
    { method: 'GET' },
  );

  return normalizeSearchResults(payload);
}

export { ApiError };