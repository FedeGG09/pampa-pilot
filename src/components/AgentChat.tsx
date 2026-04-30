import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Loader2,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';
import agronomistImg from '../assets/agronomist.jpeg';
import financeImg from '../assets/finance.png';
import machineryImg from '../assets/machinery.png';
import peopleLegalImg from '../assets/people_legal.png';
import {
  normalizeAgentReply,
  searchConversations,
  sendAgentMessage,
} from '../lib/chatApi';
import type {
  Agent,
  AgentId,
  ChatHistoryItem,
  ConversationSearchItem,
  Message,
} from '../types/chat';

const STORAGE_KEY = 'agrocopilot-agent-chat-v2';

const AGENTS: Agent[] = [
  {
    id: 'agronomist',
    name: 'Agrónomo',
    description: 'Diagnóstico, manejo, suelo, cultivos y recomendaciones técnicas.',
    image: agronomistImg,
    accentClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  {
    id: 'finance',
    name: 'Finanzas',
    description: 'Costos, margen, impacto económico, escenarios y simulaciones.',
    image: financeImg,
    accentClass: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
  {
    id: 'machinery',
    name: 'Maquinaria',
    description: 'Capacidad operativa, mantenimiento, telemetría y eficiencia.',
    image: machineryImg,
    accentClass: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  {
    id: 'people_legal',
    name: 'Gente y Legal',
    description: 'Contratos, relaciones laborales, cumplimiento y documentación.',
    image: peopleLegalImg,
    accentClass: 'bg-violet-50 text-violet-700 ring-violet-200',
  },
];

const WELCOME_MESSAGE: Record<AgentId, string> = {
  agronomist:
    'Hola, soy tu agrónomo. Contame el lote, cultivo, fecha o problema y te ayudo con una respuesta técnica.',
  finance:
    'Hola, soy el agente de finanzas. Puedo ayudarte a pensar escenarios, márgenes, costos y decisiones económicas.',
  machinery:
    'Hola, soy el agente de maquinaria. Consultame por capacidad operativa, mantenimiento o uso eficiente.',
  people_legal:
    'Hola, soy el agente de gente y legal. Puedo ayudarte a ordenar consultas sobre contratos, cumplimiento y gestión documental.',
};

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createMessage(
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
    createdAt: new Date().toISOString(),
    ...extra,
  };
}

function createInitialMessages(): Record<AgentId, Message[]> {
  return {
    agronomist: [
      createMessage('agronomist', 'assistant', WELCOME_MESSAGE.agronomist),
    ],
    finance: [createMessage('finance', 'assistant', WELCOME_MESSAGE.finance)],
    machinery: [
      createMessage('machinery', 'assistant', WELCOME_MESSAGE.machinery),
    ],
    people_legal: [
      createMessage('people_legal', 'assistant', WELCOME_MESSAGE.people_legal),
    ],
  };
}

function safeParseStoredState(): {
  selectedAgentId?: AgentId;
  messagesByAgent?: Record<AgentId, Message[]>;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      selectedAgentId?: AgentId;
      messagesByAgent?: Record<AgentId, Message[]>;
    };
  } catch {
    return null;
  }
}

function useAgentChat() {
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>('agronomist');
  const [messagesByAgent, setMessagesByAgent] = useState<Record<AgentId, Message[]>>(
    () => createInitialMessages(),
  );
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ConversationSearchItem[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const stored = safeParseStoredState();
    if (stored?.selectedAgentId) {
      setSelectedAgentId(stored.selectedAgentId);
    }
    if (stored?.messagesByAgent) {
      setMessagesByAgent(prev => ({
        ...prev,
        ...stored.messagesByAgent,
      }));
    }
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ selectedAgentId, messagesByAgent }),
    );
  }, [selectedAgentId, messagesByAgent]);

  const selectedAgent = useMemo(() => {
    return AGENTS.find(agent => agent.id === selectedAgentId) ?? AGENTS[0]!;
  }, [selectedAgentId]);

  const messages = messagesByAgent[selectedAgentId] ?? [];

  const send = async () => {
    const text = draft.trim();
    if (!text || isSending) return;

    const agentId = selectedAgentId;
    const currentAgent =
      AGENTS.find(agent => agent.id === agentId) ?? AGENTS[0]!;
    const currentMessages = messagesByAgent[agentId] ?? [];

    const userMessage = createMessage(agentId, 'user', text);
    const pendingAssistantMessage = createMessage(
      agentId,
      'assistant',
      'Escribiendo...',
      { pending: true },
    );

    const history: ChatHistoryItem[] = currentMessages
      .filter(message => message.role !== 'system')
      .map(message => ({
        role: message.role,
        content: message.content,
      }));

    setDraft('');
    setError(null);
    setIsSending(true);

    setMessagesByAgent(prev => ({
      ...prev,
      [agentId]: [...(prev[agentId] ?? []), userMessage, pendingAssistantMessage],
    }));

    try {
      const response = await sendAgentMessage({
        agentId,
        message: text,
        history,
        context: {
          agent_name: currentAgent.name,
          agent_description: currentAgent.description,
        },
      });

      const replyText = normalizeAgentReply(response);

      setMessagesByAgent(prev => ({
        ...prev,
        [agentId]: (prev[agentId] ?? []).map(message =>
          message.id === pendingAssistantMessage.id
            ? {
                ...message,
                content: replyText,
                pending: false,
              }
            : message,
        ),
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo conectar con el backend';

      setError(message);

      setMessagesByAgent(prev => ({
        ...prev,
        [agentId]: (prev[agentId] ?? []).map(messageItem =>
          messageItem.id === pendingAssistantMessage.id
            ? {
                ...messageItem,
                content: `Error al consultar el backend: ${message}`,
                pending: false,
                error: true,
              }
            : messageItem,
        ),
      }));
    } finally {
      setIsSending(false);
    }
  };

  const runSearch = async () => {
    const q = searchQuery.trim();
    if (!q || isSearching) return;

    setIsSearching(true);
    setError(null);

    try {
      const results = await searchConversations({
        query: q,
        agentId: selectedAgentId,
        limit: 10,
      });
      setSearchResults(results);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo buscar conversaciones.';
      setError(message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    agents: AGENTS,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    messages,
    draft,
    setDraft,
    isSending,
    error,
    send,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    runSearch,
  };
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[78%]',
          isUser
            ? 'rounded-br-md bg-slate-900 text-white'
            : 'rounded-bl-md border border-slate-200 bg-white text-slate-800',
          message.error ? 'border border-rose-200 bg-rose-50 text-rose-700' : '',
          message.pending ? 'opacity-80' : '',
        ].join(' ')}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div
          className={`mt-2 text-[11px] ${isUser ? 'text-slate-300' : 'text-slate-400'}`}
        >
          {new Date(message.createdAt).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {message.pending ? ' · esperando' : ''}
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({ item }: { item: ConversationSearchItem }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2">
        <Bot className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-slate-900">
            {item.title ?? item.id}
          </div>
          {item.preview ? (
            <div className="mt-1 line-clamp-2 text-xs text-slate-600">
              {item.preview}
            </div>
          ) : null}
          <div className="mt-2 text-[11px] text-slate-500">
            {item.agentId ? `agente: ${item.agentId}` : 'sin agente'}{' '}
            {item.updatedAt
              ? `· ${new Date(item.updatedAt).toLocaleString('es-AR')}`
              : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentChat() {
  const {
    agents,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    messages,
    draft,
    setDraft,
    isSending,
    error,
    send,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    runSearch,
  } = useAgentChat();

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, selectedAgentId]);

  return (
    <div className="grid min-h-[calc(100vh-2rem)] gap-4 p-4 lg:grid-cols-[360px_1fr]">
      <aside className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">AgroCopilot AI</h2>
            <p className="text-sm text-slate-500">Elegí un especialista</p>
          </div>
        </div>

        <div className="space-y-3">
          {agents.map(agent => {
            const isActive = agent.id === selectedAgentId;

            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgentId(agent.id)}
                className={[
                  'w-full rounded-3xl border p-3 text-left transition-all duration-200',
                  isActive
                    ? 'border-slate-900 bg-slate-50 shadow-md ring-1 ring-slate-900/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="h-14 w-14 rounded-2xl object-cover shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-semibold text-slate-900">
                        {agent.name}
                      </h3>
                      <span
                        className={[
                          'inline-flex h-2.5 w-2.5 rounded-full',
                          isActive ? 'bg-emerald-500' : 'bg-slate-300',
                        ].join(' ')}
                      />
                    </div>
                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      {agent.description}
                    </p>
                  </div>
                </div>
                <div
                  className={[
                    'mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1',
                    agent.accentClass,
                  ].join(' ')}
                >
                  Agente activo
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 text-sm font-medium text-slate-800">
            Buscar conversaciones
          </div>
          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void runSearch();
                }
              }}
              placeholder="Buscar por texto..."
              className="min-w-0 flex-1 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
            <button
              type="button"
              onClick={() => void runSearch()}
              disabled={isSearching || !searchQuery.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="mt-3 space-y-2">
              {searchResults.map(item => (
                <SearchResultCard key={item.id} item={item} />
              ))}
            </div>
          ) : null}
        </div>
      </aside>

      <section className="flex min-h-[72vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-4">
            <img
              src={selectedAgent.image}
              alt={selectedAgent.name}
              className="h-14 w-14 rounded-2xl object-cover shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-900">
                  Chat con {selectedAgent.name}
                </h2>
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  conectado
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {selectedAgent.description}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Endpoint configurable por entorno
          </div>
        </header>

        {error ? (
          <div className="mx-5 mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>{error}</div>
            </div>
          </div>
        ) : null}

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isSending ? (
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              El agente está respondiendo...
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>

        <form
          className="border-t border-slate-200 bg-white px-4 py-4"
          onSubmit={e => {
            e.preventDefault();
            void send();
          }}
        >
          <div className="flex items-end gap-3">
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder={`Escribí tu consulta para ${selectedAgent.name.toLowerCase()}...`}
              rows={2}
              className="max-h-44 flex-1 resize-none rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />

            <button
              type="submit"
              disabled={!draft.trim() || isSending}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Enviar
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Enter envía · Shift+Enter agrega una nueva línea
          </div>
        </form>
      </section>
    </div>
  );
}