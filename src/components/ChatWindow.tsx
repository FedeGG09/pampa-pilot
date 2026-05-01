import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  ChevronDown,
  Clock3,
  FolderClock,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import agronomistImg from '@/assets/agronomist.jpeg';
import financeImg from '@/assets/finance.png';
import machineryImg from '@/assets/machinery.png';
import peopleLegalImg from '@/assets/people_legal.png';
import { cn } from '@/lib/utils';
import {
  conversationPreview,
  createMessage,
  deriveConversationTitleFromText,
  getAgentLabel,
  isGenericConversationTitle,
  loadChatStore,
  normalizeAgentReply,
  saveChatStore,
  selectAgent,
  selectConversation,
  sortConversations,
  startNewConversation,
  updateConversation,
  sendAgentMessage,
} from '@/lib/chatApi';
import type {
  Agent,
  AgentId,
  ChatHistoryItem,
  ChatStore,
  Message,
} from '@/types/chat';

const AGENT_BY_ID: Record<AgentId, Agent> = {
  agronomist: {
    id: 'agronomist',
    name: 'Agrónomo',
    description: 'Diagnóstico, manejo, suelo, cultivos y recomendaciones técnicas.',
    image: agronomistImg,
    accentClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  finance: {
    id: 'finance',
    name: 'Finanzas',
    description: 'Costos, margen, impacto económico, escenarios y simulaciones.',
    image: financeImg,
    accentClass: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
  machinery: {
    id: 'machinery',
    name: 'Maquinaria',
    description: 'Capacidad operativa, mantenimiento, telemetría y eficiencia.',
    image: machineryImg,
    accentClass: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  people_legal: {
    id: 'people_legal',
    name: 'Gente y Legal',
    description: 'Contratos, relaciones laborales, cumplimiento y documentación.',
    image: peopleLegalImg,
    accentClass: 'bg-violet-50 text-violet-700 ring-violet-200',
  },
};

const AGENTS: Agent[] = [
  AGENT_BY_ID.agronomist,
  AGENT_BY_ID.finance,
  AGENT_BY_ID.machinery,
  AGENT_BY_ID.people_legal,
];

const QUICK_PROMPTS: Record<AgentId, string[]> = {
  agronomist: [
    '¿Qué manejo sugerís para un lote con estrés hídrico?',
    'Evaluá estado sanitario y nutricional del cultivo.',
    'Recomendame acciones para mejorar rendimiento.',
  ],
  finance: [
    'Simulá margen con estos costos y rendimiento.',
    'Ayudame a comparar dos escenarios de inversión.',
    'Estimá impacto financiero de una decisión productiva.',
  ],
  machinery: [
    'Calculá capacidad operativa de la campaña.',
    'Ayudame a ordenar mantenimiento preventivo.',
    'Estimá eficiencia de uso de maquinaria.',
  ],
  people_legal: [
    'Redactá una consulta sobre contrato de personal.',
    'Indicame puntos a revisar en documentación laboral.',
    'Ayudame a ordenar cumplimiento y registros.',
  ],
};

const OPEN_EVENT = 'agrocopilot:open-chat';
const CLOSE_EVENT = 'agrocopilot:close-chat';

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function isEnterSubmit(event: React.KeyboardEvent<HTMLTextAreaElement>) {
  return event.key === 'Enter' && !event.shiftKey;
}

function titleMatchesFilter(
  title: string,
  preview: string,
  filter: string,
  messages: Message[],
): boolean {
  const haystack =
    `${title} ${preview} ${messages.map((message) => message.content).join(' ')}`.toLowerCase();
  return haystack.includes(filter.toLowerCase());
}

function ChatBubbleSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-700 shadow-sm">
        <Sparkles className="h-4 w-4 animate-pulse" />
      </div>
      <div className="max-w-[80%] rounded-3xl rounded-tl-md border border-white/60 bg-white/90 px-4 py-3 shadow-sm">
        <div className="space-y-2">
          <div className="h-3 w-36 animate-pulse rounded-full bg-stone-200" />
          <div className="h-3 w-52 animate-pulse rounded-full bg-stone-200" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[84%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm',
          isUser
            ? 'rounded-br-md bg-[var(--primary)] text-white'
            : 'rounded-tl-md border border-stone-200/70 bg-white/95 text-stone-800',
          message.pending && 'opacity-80',
          message.error && 'border-red-200 bg-red-50 text-red-800',
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

export interface ChatWindowProps {
  open: boolean;
  onClose: () => void;
  initialAgentId?: AgentId;
  initialConversationId?: string;
}

export default function ChatWindow({
  open,
  onClose,
  initialAgentId = 'agronomist',
  initialConversationId,
}: ChatWindowProps) {
  const [store, setStore] = useState<ChatStore>(() => loadChatStore());
  const [conversationFilter, setConversationFilter] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open, store.selectedAgentId, store.selectedConversationIdByAgent]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOpen = () => {
      setStore((prev) => selectAgent(prev, initialAgentId));
    };

    if (open) {
      handleOpen();
    }
  }, [open, initialAgentId]);

  useEffect(() => {
    saveChatStore(store);
  }, [store]);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [open, store]);

  const selectedAgentId = store.selectedAgentId;
  const selectedAgent = AGENT_BY_ID[selectedAgentId];

  const conversations = useMemo(() => {
    return sortConversations(store.conversationsByAgent[selectedAgentId] ?? []);
  }, [store.conversationsByAgent, selectedAgentId]);

  const selectedConversationId =
    store.selectedConversationIdByAgent[selectedAgentId] ?? conversations[0]?.id;

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) ??
    conversations[0];

  const filteredConversations = useMemo(() => {
    const filter = conversationFilter.trim();
    if (!filter) return conversations;

    return conversations.filter((conversation) =>
      titleMatchesFilter(
        conversation.title,
        conversationPreview(conversation),
        filter,
        conversation.messages,
      ),
    );
  }, [conversationFilter, conversations]);

  const currentDraft = store.draftsByAgent[selectedAgentId] ?? '';

  const canSend = Boolean(currentDraft.trim()) && !isSending && Boolean(selectedConversation);

  const handleSelectAgent = (agentId: AgentId) => {
    setStore((prev) => selectAgent(prev, agentId));
  };

  const handleSelectConversation = (conversationId: string) => {
    setStore((prev) => selectConversation(prev, selectedAgentId, conversationId));
  };

  const handleNewConversation = () => {
    setStore((prev) => startNewConversation(prev, selectedAgentId));
    setConversationFilter('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleQuickPrompt = (prompt: string) => {
    setStore((prev) => ({
      ...prev,
      draftsByAgent: {
        ...prev.draftsByAgent,
        [selectedAgentId]: prompt,
      },
    }));
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleSend = async () => {
    const text = currentDraft.trim();
    if (!text || isSending || !selectedConversation) return;

    const agentId = selectedAgentId;
    const agent = AGENT_BY_ID[agentId];
    const conversationId = selectedConversation.id;

    const userMessage = createMessage(agentId, 'user', text, { conversationId });
    const assistantPending = createMessage(agentId, 'assistant', 'Escribiendo...', {
      pending: true,
      conversationId,
    });

    const history: ChatHistoryItem[] = selectedConversation.messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    setStore((prev) =>
      updateConversation(prev, agentId, conversationId, (conversation) => {
        const nextTitle = isGenericConversationTitle(conversation.title)
          ? deriveConversationTitleFromText(text)
          : conversation.title;

        return {
          ...conversation,
          title: nextTitle,
          updatedAt: new Date().toISOString(),
          messages: [...conversation.messages, userMessage, assistantPending],
        };
      }),
    );

    setStore((prev) => ({
      ...prev,
      draftsByAgent: {
        ...prev.draftsByAgent,
        [agentId]: '',
      },
    }));

    setError(null);
    setIsSending(true);

    try {
      const response = await sendAgentMessage({
        agentId,
        message: text,
        history,
        conversationId,
        conversationTitle: selectedConversation.title,
        context: {
          agent_name: agent.name,
          agent_description: agent.description,
          conversation_id: conversationId,
          conversation_title: selectedConversation.title,
        },
      });

      const replyText = normalizeAgentReply(response);

      setStore((prev) =>
        updateConversation(prev, agentId, conversationId, (conversation) => ({
          ...conversation,
          updatedAt: new Date().toISOString(),
          messages: conversation.messages.map((message) =>
            message.id === assistantPending.id
              ? {
                  ...message,
                  content: replyText,
                  pending: false,
                }
              : message,
          ),
        })),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo conectar con el backend.';

      setError(message);

      setStore((prev) =>
        updateConversation(prev, agentId, conversationId, (conversation) => ({
          ...conversation,
          updatedAt: new Date().toISOString(),
          messages: conversation.messages.map((messageItem) =>
            messageItem.id === assistantPending.id
              ? {
                  ...messageItem,
                  content: `Error al consultar el backend: ${message}`,
                  pending: false,
                  error: true,
                }
              : messageItem,
          ),
        })),
      );
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] flex items-end justify-end bg-black/20 p-3 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="flex h-[min(88vh,920px)] w-full max-w-[31rem] flex-col overflow-hidden rounded-[28px] border border-stone-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,244,0.96))] shadow-2xl backdrop-blur md:w-[31rem]"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="border-b border-stone-200/70 bg-white/90 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-sm">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Chat flotante
                  </p>
                  <h3 className="text-lg font-semibold text-stone-900">
                    AgroCopilot AI
                  </h3>
                  <p className="text-sm text-stone-500">
                    Elegí un agente, retomá una conversación y seguí el historial.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
                aria-label="Cerrar chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="border-b border-stone-200/70 bg-white/70 px-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {AGENTS.map((agent) => {
                const active = agent.id === selectedAgentId;
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => handleSelectAgent(agent.id)}
                    className={cn(
                      'group rounded-3xl border p-2 text-left transition',
                      active
                        ? 'border-[var(--primary)] bg-emerald-50 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={agent.image}
                        alt={agent.name}
                        className="h-11 w-11 rounded-2xl object-cover shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-stone-900">
                            {agent.name}
                          </span>
                          <span
                            className={cn(
                              'h-2.5 w-2.5 rounded-full',
                              active ? 'bg-[var(--primary)]' : 'bg-stone-300',
                            )}
                          />
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-stone-500">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                {getAgentLabel(selectedAgentId)} activo
              </div>
              <button
                type="button"
                onClick={handleNewConversation}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <Plus className="h-3.5 w-3.5" />
                Nueva conversación
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_PROMPTS[selectedAgentId].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleQuickPrompt(item)}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-left text-[11px] font-medium text-stone-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-3xl border border-stone-200 bg-stone-50 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-stone-800">
                <FolderClock className="h-4 w-4" />
                Conversaciones guardadas
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2">
                  <Search className="h-4 w-4 text-stone-400" />
                  <input
                    value={conversationFilter}
                    onChange={(event) => setConversationFilter(event.target.value)}
                    placeholder="Buscar conversación..."
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
                  />
                </div>
                <span className="rounded-full bg-white px-3 py-2 text-xs text-stone-500">
                  {filteredConversations.length}
                </span>
              </div>

              <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
                {filteredConversations.map((conversation) => {
                  const active = conversation.id === selectedConversation?.id;
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={cn(
                        'w-full rounded-2xl border p-3 text-left transition',
                        active
                          ? 'border-[var(--primary)] bg-white shadow-sm'
                          : 'border-stone-200 bg-white/90 hover:border-emerald-200 hover:bg-emerald-50/40',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-stone-900">
                            {conversation.title}
                          </div>
                          <div className="mt-1 line-clamp-2 text-[11px] leading-4 text-stone-500">
                            {conversationPreview(conversation)}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          {active ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Activa
                            </span>
                          ) : (
                            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
                              Retomar
                            </span>
                          )}
                          <span className="text-[10px] text-stone-400">
                            {fmtDate(conversation.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredConversations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-3 py-4 text-center text-xs text-stone-500">
                    No hay conversaciones que coincidan con el filtro.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="chat-scrollbar flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {selectedConversation?.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isSending ? <ChatBubbleSkeleton /> : null}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-stone-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,245,0.98))] p-4">
            {error ? (
              <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {error}
              </div>
            ) : null}

            <div className="flex items-end gap-2 rounded-[22px] border border-stone-200 bg-white p-2 shadow-sm">
              <textarea
                ref={inputRef}
                value={currentDraft}
                onChange={(event) =>
                  setStore((prev) => ({
                    ...prev,
                    draftsByAgent: {
                      ...prev.draftsByAgent,
                      [selectedAgentId]: event.target.value,
                    },
                  }))
                }
                onKeyDown={(event) => {
                  if (isEnterSubmit(event)) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                rows={1}
                placeholder={`Escribí tu consulta para ${selectedAgent.name.toLowerCase()}...`}
                className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-stone-900 outline-none placeholder:text-stone-400"
              />

              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!canSend}
                className={cn(
                  'inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium transition',
                  canSend
                    ? 'bg-[var(--primary)] text-white shadow-sm hover:brightness-110 active:brightness-95'
                    : 'cursor-not-allowed bg-stone-100 text-stone-400',
                )}
              >
                <Send className="h-4 w-4" />
                Enviar
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-stone-500">
              <span className="inline-flex items-center gap-1.5">
                <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                Enter para enviar · Shift + Enter para salto de línea
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                Historial persistente
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}