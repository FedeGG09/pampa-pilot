import type {
  AgentId,
  ApiResponse,
  ChatHistoryItem,
  ChatStore,
  ConversationSearchItem,
  ConversationThread,
  Message,
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

const AGENT_CONFIG: Record<
  AgentId,
  {
    endpoint: string;
    label: string;
    welcome: string;
  }
> = {
  agronomist: {
    endpoint: (
      import.meta.env.VITE_AGRONOMIST_CHAT_ENDPOINT ?? '/agronomist/chat'
    ).replace(/\/+$/, ''),
    label: 'Agrónomo',
    welcome:
      'Hola, soy tu agrónomo. Contame el lote, cultivo, fecha o problema y te ayudo con una respuesta técnica.',
  },
  finance: {
    endpoint: (
      import.meta.env.VITE_FINANCE_CHAT_ENDPOINT ?? '/finance/chat'
    ).replace(/\/+$/, ''),
    label: 'Finanzas',
    welcome:
      'Hola, soy el agente de finanzas. Puedo ayudarte a pensar escenarios, márgenes, costos y decisiones económicas.',
  },
  machinery: {
    endpoint: (
      import.meta.env.VITE_MACHINERY_CHAT_ENDPOINT ?? CHAT_ENDPOINT
    ).replace(/\/+$/, ''),
    label: 'Maquinaria',
    welcome:
      'Hola, soy el agente de maquinaria. Consultame por capacidad operativa, mantenimiento o uso eficiente.',
  },
  people_legal: {
    endpoint: (
      import.meta.env.VITE_PEOPLE_LEGAL_CHAT_ENDPOINT ?? CHAT_ENDPOINT
    ).replace(/\/+$/, ''),
    label: 'Gente y Legal',
    welcome:
      'Hola, soy el agente de gente y legal. Puedo ayudarte a ordenar consultas sobre contratos, cumplimiento y gestión documental.',
  },
};

const STORAGE_KEY = 'agrocopilot-floating-chat-store-v4';

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function truncate(text: string, max = 42): string {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function resolveAgentConfig(agentId: AgentId) {
  const config = AGENT_CONFIG[agentId];
  if (!config) {
    throw new ApiError(`Agent config not found for ${agentId}`);
  }
  return config;
}

export function getAgentLabel(agentId: AgentId): string {
  return resolveAgentConfig(agentId).label;
}

function createWelcomeMessage(agentId: AgentId, conversationId = ''): Message {
  return {
    id: uid(),
    agentId,
    role: 'assistant',
    content: resolveAgentConfig(agentId).welcome,
    createdAt: nowIso(),
    conversationId,
  };
}

export function createMessage(
  agentId: AgentId,
  role: Message['role'],
  content: string,
  extra?: Partial<Message>,
): Message {
  return {
    id: uid(),
    agentId,
    role,
    content,
    createdAt: nowIso(),
    ...extra,
  };
}

export function createConversation(
  agentId: AgentId,
  index = 1,
  title?: string,
): ConversationThread {
  const id = uid();
  const createdAt = nowIso();

  return {
    id,
    agentId,
    title: title?.trim() || `Conversación ${index}`,
    createdAt,
    updatedAt: createdAt,
    messages: [createWelcomeMessage(agentId, id)],
  };
}

export function deriveConversationTitleFromText(text: string): string {
  return truncate(text, 48);
}

export function conversationPreview(thread: ConversationThread): string {
  const last = thread.messages[thread.messages.length - 1];
  return last?.content ? truncate(last.content, 72) : 'Sin mensajes';
}

export function isGenericConversationTitle(title: string): boolean {
  return /^Conversación\s+\d+$/i.test(title) || title === 'Nueva conversación';
}

export function sortConversations(
  conversations: ConversationThread[],
): ConversationThread[] {
  return [...conversations].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function normalizeMessage(
  candidate: unknown,
  agentId: AgentId,
  conversationId: string,
): Message {
  const item = isRecord(candidate) ? candidate : {};
  const role =
    item.role === 'assistant' || item.role === 'system' ? item.role : 'user';

  return {
    id: typeof item.id === 'string' ? item.id : uid(),
    agentId: (item.agentId as AgentId | undefined) ?? agentId,
    role,
    content: typeof item.content === 'string' ? item.content : '',
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : nowIso(),
    conversationId,
    pending: Boolean(item.pending),
    error: Boolean(item.error),
  };
}

function normalizeConversation(
  candidate: unknown,
  agentId: AgentId,
  index: number,
): ConversationThread {
  const item = isRecord(candidate) ? candidate : {};
  const id = typeof item.id === 'string' ? item.id : uid();
  const rawTitle = typeof item.title === 'string' ? item.title.trim() : '';
  const createdAt = typeof item.createdAt === 'string' ? item.createdAt : nowIso();
  const updatedAt =
    typeof item.updatedAt === 'string' ? item.updatedAt : createdAt;

  const messages =
    Array.isArray(item.messages) && item.messages.length > 0
      ? item.messages.map((message) => normalizeMessage(message, agentId, id))
      : [createWelcomeMessage(agentId, id)];

  return {
    id,
    agentId: (item.agentId as AgentId | undefined) ?? agentId,
    title: rawTitle || `Conversación ${index}`,
    createdAt,
    updatedAt,
    messages,
  };
}

function firstConversationId(conversations: ConversationThread[], agentId: AgentId) {
  if (conversations.length > 0) {
    return conversations[0]!.id;
  }
  return createConversation(agentId, 1).id;
}

function createInitialChatStore(): ChatStore {
  const conversationsByAgent = {
    agronomist: [createConversation('agronomist', 1)],
    finance: [createConversation('finance', 1)],
    machinery: [createConversation('machinery', 1)],
    people_legal: [createConversation('people_legal', 1)],
  } satisfies ChatStore['conversationsByAgent'];

  return {
    selectedAgentId: 'agronomist',
    selectedConversationIdByAgent: {
      agronomist: conversationsByAgent.agronomist[0]!.id,
      finance: conversationsByAgent.finance[0]!.id,
      machinery: conversationsByAgent.machinery[0]!.id,
      people_legal: conversationsByAgent.people_legal[0]!.id,
    },
    conversationsByAgent,
    draftsByAgent: {
      agronomist: '',
      finance: '',
      machinery: '',
      people_legal: '',
    },
  };
}

function normalizeStore(candidate: Partial<ChatStore> | null | undefined): ChatStore {
  const base = createInitialChatStore();
  if (!candidate) return base;

  const sourceConversations = candidate.conversationsByAgent ?? base.conversationsByAgent;

  const agronomistSource = sourceConversations.agronomist ?? [];
  const financeSource = sourceConversations.finance ?? [];
  const machinerySource = sourceConversations.machinery ?? [];
  const legalSource = sourceConversations.people_legal ?? [];

  const conversationsByAgent: ChatStore['conversationsByAgent'] = {
    agronomist: sortConversations(
      agronomistSource.length > 0
        ? agronomistSource.map((thread, index) =>
            normalizeConversation(thread, 'agronomist', index + 1),
          )
        : [createConversation('agronomist', 1)],
    ),
    finance: sortConversations(
      financeSource.length > 0
        ? financeSource.map((thread, index) =>
            normalizeConversation(thread, 'finance', index + 1),
          )
        : [createConversation('finance', 1)],
    ),
    machinery: sortConversations(
      machinerySource.length > 0
        ? machinerySource.map((thread, index) =>
            normalizeConversation(thread, 'machinery', index + 1),
          )
        : [createConversation('machinery', 1)],
    ),
    people_legal: sortConversations(
      legalSource.length > 0
        ? legalSource.map((thread, index) =>
            normalizeConversation(thread, 'people_legal', index + 1),
          )
        : [createConversation('people_legal', 1)],
    ),
  };

  const selectedConversationIdByAgent: ChatStore['selectedConversationIdByAgent'] = {
    agronomist:
      candidate.selectedConversationIdByAgent?.agronomist ??
      firstConversationId(conversationsByAgent.agronomist, 'agronomist'),
    finance:
      candidate.selectedConversationIdByAgent?.finance ??
      firstConversationId(conversationsByAgent.finance, 'finance'),
    machinery:
      candidate.selectedConversationIdByAgent?.machinery ??
      firstConversationId(conversationsByAgent.machinery, 'machinery'),
    people_legal:
      candidate.selectedConversationIdByAgent?.people_legal ??
      firstConversationId(conversationsByAgent.people_legal, 'people_legal'),
  };

  (Object.keys(conversationsByAgent) as AgentId[]).forEach((agentId) => {
    const exists = conversationsByAgent[agentId].some(
      (thread) => thread.id === selectedConversationIdByAgent[agentId],
    );
    if (!exists) {
      selectedConversationIdByAgent[agentId] = firstConversationId(
        conversationsByAgent[agentId],
        agentId,
      );
    }
  });

  return {
    selectedAgentId: candidate.selectedAgentId ?? 'agronomist',
    selectedConversationIdByAgent,
    conversationsByAgent,
    draftsByAgent: {
      agronomist: candidate.draftsByAgent?.agronomist ?? '',
      finance: candidate.draftsByAgent?.finance ?? '',
      machinery: candidate.draftsByAgent?.machinery ?? '',
      people_legal: candidate.draftsByAgent?.people_legal ?? '',
    },
  };
}

export function loadChatStore(): ChatStore {
  if (typeof window === 'undefined') {
    return createInitialChatStore();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialChatStore();
    return normalizeStore(JSON.parse(raw) as Partial<ChatStore>);
  } catch {
    return createInitialChatStore();
  }
}

export function saveChatStore(store: ChatStore): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function selectAgent(store: ChatStore, agentId: AgentId): ChatStore {
  const normalized = normalizeStore(store);
  const conversations = normalized.conversationsByAgent[agentId];

  const activeId = normalized.selectedConversationIdByAgent[agentId];
  const nextActiveId = conversations.some((thread) => thread.id === activeId)
    ? activeId
    : firstConversationId(conversations, agentId);

  return {
    ...normalized,
    selectedAgentId: agentId,
    selectedConversationIdByAgent: {
      ...normalized.selectedConversationIdByAgent,
      [agentId]: nextActiveId,
    },
  };
}

export function selectConversation(
  store: ChatStore,
  agentId: AgentId,
  conversationId: string,
): ChatStore {
  const normalized = normalizeStore(store);
  const conversations = normalized.conversationsByAgent[agentId];
  const exists = conversations.some((thread) => thread.id === conversationId);

  if (!exists) return normalized;

  return {
    ...normalized,
    selectedAgentId: agentId,
    selectedConversationIdByAgent: {
      ...normalized.selectedConversationIdByAgent,
      [agentId]: conversationId,
    },
  };
}

export function startNewConversation(
  store: ChatStore,
  agentId: AgentId,
): ChatStore {
  const normalized = normalizeStore(store);
  const conversations = normalized.conversationsByAgent[agentId] ?? [];
  const nextIndex = conversations.length + 1;
  const conversation = createConversation(agentId, nextIndex);

  return {
    ...normalized,
    selectedAgentId: agentId,
    selectedConversationIdByAgent: {
      ...normalized.selectedConversationIdByAgent,
      [agentId]: conversation.id,
    },
    conversationsByAgent: {
      ...normalized.conversationsByAgent,
      [agentId]: [conversation, ...conversations],
    },
  };
}

export function updateConversation(
  store: ChatStore,
  agentId: AgentId,
  conversationId: string,
  updater: (conversation: ConversationThread) => ConversationThread,
): ChatStore {
  const normalized = normalizeStore(store);
  const conversations = normalized.conversationsByAgent[agentId] ?? [];
  const nextConversations = conversations.map((conversation) =>
    conversation.id === conversationId ? updater(conversation) : conversation,
  );

  return {
    ...normalized,
    conversationsByAgent: {
      ...normalized.conversationsByAgent,
      [agentId]: sortConversations(nextConversations),
    },
  };
}

function buildUrlWithQuery(path: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

type SafeRequestInit = Omit<RequestInit, 'body' | 'headers'> & {
  headers?: HeadersInit;
  body?: BodyInit | null;
};

async function request<TResponse>(
  path: string,
  init: SafeRequestInit = {},
): Promise<TResponse> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 45_000);

  try {
    const { headers, body, ...rest } = init;
    const resolvedHeaders = new Headers(headers ?? {});

    resolvedHeaders.set('Accept', 'application/json');
    if (body !== undefined) {
      resolvedHeaders.set('Content-Type', 'application/json');
    }

    const requestInit: RequestInit = {
      ...rest,
      headers: resolvedHeaders,
      signal: controller.signal,
    };

    if (body !== undefined) {
      (requestInit as RequestInit & { body?: BodyInit | null }).body = body;
    }

    const response = await fetch(buildUrl(path), requestInit);

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
  return resolveAgentConfig(agentId).endpoint;
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
  conversationId?: string;
  conversationTitle?: string;
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
    conversation_id: input.conversationId,
    conversation_title: input.conversationTitle,
    context: {
      ...(input.context ?? {}),
      agent_id: input.agentId,
      conversation_id: input.conversationId,
      conversation_title: input.conversationTitle,
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

  const path = buildUrlWithQuery(CHAT_SEARCH_ENDPOINT, params);
  const payload = await request<
    SearchConversationsResponse | ConversationSearchItem[] | unknown
  >(path, { method: 'GET' });

  return normalizeSearchResults(payload);
}

export { ApiError, BASE_URL as CHAT_API_BASE_URL };