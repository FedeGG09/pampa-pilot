import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Leaf,
  MessageCircle,
  Paperclip,
  Plus,
  Scale,
  Search,
  Send,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  fetchChatConversation,
  fetchChatConversations,
  sendSupervisorChat,
} from '@/lib/api'
import { cn } from '@/lib/utils'
import type {
  AgentKey,
  ChatMessage,
  ConversationDetailResponse,
  ConversationItem,
  SupervisorChatResponse,
} from '@/types/api'

type UiBubble = {
  id: string
  role: 'user' | 'assistant'
  content: string
  agent: AgentKey
  timeLabel: string
  clarificationQuestion?: string | null
  topics?: string[]
  toolResults?: Record<string, unknown>
  provider?: string | null
  needsClarification?: boolean
}

type AgentMeta = {
  key: AgentKey
  label: string
  subtitle: string
  icon: typeof Leaf
  greeting: string
  promptPills: string[]
  accent: string
  ring: string
  badge: string
}

const AGENT_META: Record<AgentKey, AgentMeta> = {
  agronomist: {
    key: 'agronomist',
    label: 'Agrónomo',
    subtitle: 'Suelos, cultivos y sanidad',
    icon: Leaf,
    greeting:
      '¡Hola! Soy tu asistente Agrónomo 🌱\n¿En qué puedo ayudarte hoy con tus cultivos o suelos?',
    promptPills: ['Plan específico', 'Suelos arenosos', 'Cobertura ideal', 'Más recomendaciones'],
    accent: 'from-lime-100 to-emerald-100',
    ring: 'ring-lime-300/50',
    badge: 'bg-lime-50 text-lime-700 border-lime-200',
  },
  finance: {
    key: 'finance',
    label: 'Finanzas',
    subtitle: 'Costos, márgenes y análisis',
    icon: Calculator,
    greeting:
      '¡Hola! Soy tu asistente de Finanzas 💼\n¿Querés revisar costos, márgenes o un escenario económico?',
    promptPills: ['Costo por ha', 'Margen bruto', 'Escenario dólar', 'Sensibilidad precio'],
    accent: 'from-sky-100 to-cyan-100',
    ring: 'ring-sky-300/50',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  machinery: {
    key: 'machinery',
    label: 'Maquinaria',
    subtitle: 'Operación, mantenimiento y telemetría',
    icon: Wrench,
    greeting:
      '¡Hola! Soy tu asistente de Maquinaria ⚙️\n¿Querés optimizar operación, consumo o mantenimiento?',
    promptPills: ['Mantenimiento', 'Consumo por ha', 'Calibración', 'Telemetría'],
    accent: 'from-amber-100 to-orange-100',
    ring: 'ring-amber-300/50',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  people_legal: {
    key: 'people_legal',
    label: 'Gente y Legal',
    subtitle: 'Laboral, legal y cumplimiento',
    icon: Scale,
    greeting:
      '¡Hola! Soy tu asistente de Gente y Legal 🧾\n¿Necesitás ordenar un tema laboral, documental o de cumplimiento?',
    promptPills: ['Contrato', 'Licencia', 'Confidencialidad', 'Cumplimiento'],
    accent: 'from-violet-100 to-fuchsia-100',
    ring: 'ring-violet-300/50',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
  },
}

const AGENT_ORDER: AgentKey[] = ['agronomist', 'finance', 'machinery', 'people_legal']
const USER_ID_KEY = 'pampa-pilot.chat.user-id'

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return `guest-${Date.now()}`

  const existing = window.localStorage.getItem(USER_ID_KEY)
  if (existing) return existing

  const generated = `u-${createId().slice(0, 8)}`
  window.localStorage.setItem(USER_ID_KEY, generated)
  return generated
}

function formatTimeLabel(date = new Date()): string {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function normalizeRole(role: ChatMessage['role']): 'user' | 'assistant' {
  return role === 'user' ? 'user' : 'assistant'
}

function bucketByDate(updatedAt: string | null): string {
  if (!updatedAt) return 'Más antiguas'

  const date = new Date(updatedAt)
  if (Number.isNaN(date.getTime())) return 'Más antiguas'

  const now = new Date()
  const diffDays = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) /
      86400000,
  )

  if (diffDays <= 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays <= 7) return 'Esta semana'
  return 'Más antiguas'
}

function sortBuckets(a: string, b: string): number {
  const order = ['Hoy', 'Ayer', 'Esta semana', 'Más antiguas']
  return order.indexOf(a) - order.indexOf(b)
}

function conversationPreview(item: ConversationItem): string {
  const text = item.summary?.trim() || 'Sin resumen disponible.'
  return text.length > 92 ? `${text.slice(0, 92).trim()}…` : text
}

function getAgentMeta(agent: AgentKey): AgentMeta {
  return AGENT_META[agent] ?? AGENT_META.agronomist
}

function messageToBubble(message: ChatMessage, agent: AgentKey): UiBubble {
  return {
    id: createId(),
    role: normalizeRole(message.role),
    content: message.content,
    agent,
    timeLabel: formatTimeLabel(),
  }
}

function assistantBubbleFromResponse(response: SupervisorChatResponse): UiBubble {
  return {
    id: createId(),
    role: 'assistant',
    content: response.reply || 'Sin respuesta del asistente.',
    agent: response.agent,
    timeLabel: formatTimeLabel(),
    clarificationQuestion: response.clarification_question,
    topics: response.knowledge_topics ?? [],
    toolResults: response.tool_results ?? {},
    provider: response.llm_provider,
    needsClarification: response.needs_clarification,
  }
}

function EmptyConversationState({
  agent,
  onPrompt,
}: {
  agent: AgentMeta
  onPrompt: (value: string) => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-8 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-lime-200 bg-lime-50 text-lime-700 shadow-sm">
        <agent.icon className="h-8 w-8" />
      </div>

      <div className="max-w-xl">
        <p className="text-2xl font-semibold tracking-tight text-stone-900">
          {agent.greeting.split('\n')[0]}
        </p>
        <p className="mt-2 whitespace-pre-line text-base leading-7 text-stone-600">
          {agent.greeting.split('\n').slice(1).join('\n')}
        </p>
      </div>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {agent.promptPills.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => onPrompt(pill)}
            className="rounded-full border border-stone-200 bg-white px-4 py-3 text-left text-sm font-medium text-stone-700 transition hover:border-lime-300 hover:bg-lime-50 hover:text-lime-800"
          >
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-lime-600" />
              {pill}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageBubble({ bubble }: { bubble: UiBubble }) {
  const isUser = bubble.role === 'user'
  const meta = getAgentMeta(bubble.agent)

  return (
    <div className={cn('flex w-full gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-lime-200 bg-lime-50 text-lime-700 shadow-sm">
          <meta.icon className="h-5 w-5" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[82%] rounded-[28px] px-5 py-4 text-[15px] leading-7 shadow-sm sm:max-w-[74%]',
          isUser
            ? 'rounded-br-md border border-lime-200 bg-lime-100 text-stone-900'
            : 'rounded-bl-md border border-stone-200 bg-white text-stone-900',
        )}
      >
        <p className="whitespace-pre-wrap">{bubble.content}</p>

        {!isUser && bubble.topics && bubble.topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {bubble.topics.slice(0, 4).map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center rounded-full border border-lime-200 bg-lime-50 px-2.5 py-1 text-[11px] font-medium text-lime-700"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {!isUser && bubble.needsClarification && bubble.clarificationQuestion && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {bubble.clarificationQuestion}
          </div>
        )}

        <div
          className={cn(
            'mt-2 flex items-center justify-end gap-2 text-[11px] text-stone-400',
            isUser ? 'text-right' : 'text-left',
          )}
        >
          <Clock3 className="h-3 w-3" />
          {bubble.timeLabel}
        </div>
      </div>

      {isUser && (
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-lime-200 bg-lime-700 text-white shadow-sm">
          <Bot className="h-5 w-5" />
        </div>
      )}
    </div>
  )
}

export default function ChatFloatingButton() {
  const [open, setOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeAgent, setActiveAgent] = useState<AgentKey>('agronomist')
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [conversationTitle, setConversationTitle] = useState<string | null>(null)
  const [messages, setMessages] = useState<UiBubble[]>([])
  const [input, setInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingList, setLoadingList] = useState(false)
  const [loadingThread, setLoadingThread] = useState(false)
  const [sending, setSending] = useState(false)
  const [userId] = useState<string>(getOrCreateUserId)
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const currentAgent = getAgentMeta(activeAgent)

  const filteredConversations = useMemo(
    () => conversations.filter((item) => item.agent === activeAgent),
    [conversations, activeAgent],
  )

  const groupedConversations = useMemo(() => {
    const groups = new Map<string, ConversationItem[]>()

    for (const item of filteredConversations) {
      const key = bucketByDate(item.updated_at)
      const list = groups.get(key) ?? []
      list.push(item)
      groups.set(key, list)
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => sortBuckets(a, b))
      .map(([label, items]) => ({
        label,
        items: items.sort((a, b) => {
          const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0
          const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0
          return dateB - dateA
        }),
      }))
  }, [filteredConversations])

  const refreshList = useCallback(
    async (query = searchQuery) => {
      setLoadingList(true)
      setError(null)

      try {
        const payload = await fetchChatConversations(userId, query.trim())
        setConversations(Array.isArray(payload.items) ? payload.items : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las conversaciones.')
      } finally {
        setLoadingList(false)
      }
    },
    [searchQuery, userId],
  )

  const loadThread = useCallback(
    async (threadId: string) => {
      setLoadingThread(true)
      setError(null)

      try {
        const detail: ConversationDetailResponse = await fetchChatConversation(threadId)
        const agent = (detail.agent || activeAgent) as AgentKey
        const agentMeta = getAgentMeta(agent)

        setActiveAgent(agent)
        setActiveThreadId(detail.thread_id)
        setConversationTitle(detail.title || agentMeta.label)

        const nextMessages = (detail.messages || [])
          .filter((item) => item.role === 'user' || item.role === 'assistant')
          .map((item) => messageToBubble(item, agent))

        setMessages(nextMessages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo abrir la conversación.')
        setMessages([])
      } finally {
        setLoadingThread(false)
      }
    },
    [activeAgent],
  )

  const handlePickConversation = useCallback(
    async (item: ConversationItem) => {
      setActiveAgent(item.agent as AgentKey)
      await loadThread(item.thread_id)
    },
    [loadThread],
  )

  const handleNewConversation = useCallback(() => {
    setActiveThreadId(null)
    setConversationTitle(null)
    setMessages([])
    setInput('')
    setError(null)
    inputRef.current?.focus()
  }, [])

  const handlePickAgent = useCallback(
    async (agent: AgentKey) => {
      setActiveAgent(agent)
      setConversationTitle(null)
      setError(null)

      const candidate = conversations.find((item) => item.agent === agent)
      if (candidate) {
        await loadThread(candidate.thread_id)
        return
      }

      setActiveThreadId(null)
      setMessages([])
      setInput('')
    },
    [conversations, loadThread],
  )

  const handleSend = useCallback(async () => {
    const content = input.trim()
    if (!content || sending) return

    const userBubble: UiBubble = {
      id: createId(),
      role: 'user',
      content,
      agent: activeAgent,
      timeLabel: formatTimeLabel(),
    }

    const previousMessages = messages.map((item) => ({
      role: item.role,
      content: item.content,
    })) as ChatMessage[]

    setMessages((prev) => [...prev, userBubble])
    setInput('')
    setSending(true)
    setError(null)

    try {
      const response: SupervisorChatResponse = await sendSupervisorChat({
        user_id: userId,
        thread_id: activeThreadId,
        message: content,
        history: previousMessages,
        context: {
          preferred_agent: activeAgent,
          source: 'floating_chat',
        },
      })

      setActiveThreadId(response.thread_id)
      setActiveAgent(response.agent)
      setConversationTitle(response.conversation_title || getAgentMeta(response.agent).label)

      const assistantBubble = assistantBubbleFromResponse(response)
      setMessages((prev) => [...prev, assistantBubble])

      await refreshList()
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content: 'No pude conectar con el asistente en este momento. Intentá nuevamente.',
          agent: activeAgent,
          timeLabel: formatTimeLabel(),
        },
      ])
      setError(err instanceof Error ? err.message : 'Error inesperado al enviar el mensaje.')
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [activeAgent, activeThreadId, input, messages, refreshList, sending, userId])

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      void handleSend()
    }
  }

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      void refreshList()
    }, 200)
    return () => window.clearTimeout(timer)
  }, [open, refreshList])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => {
      void refreshList(searchQuery)
    }, 280)
    return () => window.clearTimeout(timer)
  }, [searchQuery, open, refreshList])

  useEffect(() => {
    if (!open) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loadingThread, sending, open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80] bg-white"
          >
            <div className="flex h-screen w-screen flex-col overflow-hidden">
              <header className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4 shadow-sm">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                    Agentes disponibles
                  </p>
                  <p className="truncate text-lg font-semibold text-stone-900">
                    {conversationTitle || currentAgent.label}
                  </p>
                  <p className="truncate text-sm text-stone-500">{currentAgent.subtitle}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'hidden rounded-full border px-3 py-1 text-xs font-medium sm:inline-flex',
                      currentAgent.badge,
                    )}
                  >
                    {activeThreadId ? 'Conversación activa' : 'Nueva conversación'}
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl border border-stone-200 bg-white shadow-sm hover:bg-stone-50"
                    aria-label="Cerrar chat"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </header>

              <div className="grid min-h-0 flex-1 grid-cols-[340px_1fr]">
                <aside className="flex min-h-0 flex-col border-r border-stone-200 bg-stone-50">
                  <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-4">
                    <div>
                      <h2 className="text-[22px] font-semibold tracking-tight text-stone-900">
                        Conversaciones
                      </h2>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarCollapsed((value) => !value)}
                      className="rounded-2xl border border-stone-200 bg-white/80 text-stone-500 shadow-sm hover:bg-stone-50"
                      aria-label={sidebarCollapsed ? 'Expandir conversaciones' : 'Contraer conversaciones'}
                    >
                      {sidebarCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronLeft className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="px-4 pb-4 pt-4">
                    <div className="flex items-center gap-3 rounded-[22px] border border-stone-200 bg-white px-4 py-3 shadow-sm">
                      <Search className="h-4 w-4 text-stone-400" />
                      <Input
                        value={searchQuery}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setSearchQuery(event.target.value)
                        }
                        placeholder="Buscar conversaciones..."
                        className="h-auto border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-stone-400 focus-visible:ring-0"
                      />
                    </div>

                    <div className="mt-4 rounded-[24px] border border-white bg-white/60 p-3 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                          Conversaciones guardadas
                        </span>
                        {loadingList && <span className="text-[11px] text-stone-400">Cargando…</span>}
                      </div>

                      <ScrollArea className="h-[calc(100vh-310px)] pr-2">
                        {groupedConversations.length === 0 ? (
                          <div className="rounded-[20px] border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-500">
                            {searchQuery.trim()
                              ? 'No encontré conversaciones con ese término.'
                              : 'Todavía no hay conversaciones para este agente.'}
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {groupedConversations.map((group) => (
                              <div key={group.label} className="space-y-3">
                                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                                  {group.label}
                                </p>

                                <div className="space-y-2">
                                  {group.items.map((item) => {
                                    const active = item.thread_id === activeThreadId
                                    return (
                                      <button
                                        key={item.thread_id}
                                        type="button"
                                        onClick={() => void handlePickConversation(item)}
                                        className={cn(
                                          'w-full rounded-[22px] border p-3 text-left transition',
                                          active
                                            ? 'border-lime-300 bg-lime-50/80 shadow-sm'
                                            : 'border-stone-200 bg-white hover:border-lime-200 hover:bg-lime-50/40',
                                        )}
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-stone-900">
                                              {item.title || 'Conversación'}
                                            </p>
                                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-500">
                                              {conversationPreview(item)}
                                            </p>
                                          </div>

                                          <div className="flex shrink-0 flex-col items-end gap-2">
                                            <span className="text-[11px] text-stone-400">
                                              {item.updated_at
                                                ? new Intl.DateTimeFormat('es-AR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                  }).format(new Date(item.updated_at))
                                                : ''}
                                            </span>
                                            <span
                                              className={cn(
                                                'inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium',
                                                active
                                                  ? 'bg-lime-100 text-lime-700'
                                                  : 'bg-stone-100 text-stone-500',
                                              )}
                                            >
                                              {active ? 'Activa' : `${item.turns} msgs`}
                                            </span>
                                          </div>
                                        </div>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </div>

                  <div className="mt-auto px-4 pb-4">
                    <Button
                      type="button"
                      onClick={handleNewConversation}
                      className="h-14 w-full rounded-[22px] bg-lime-200 text-[15px] font-semibold text-lime-950 shadow-sm transition hover:bg-lime-300"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva conversación
                    </Button>
                  </div>
                </aside>

                <section className="flex min-h-0 min-w-0 flex-col bg-gradient-to-b from-white via-white to-stone-50/70">
                  <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto]">
                    <ScrollArea className="min-h-0">
                      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-6">
                        {error && (
                          <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                          </div>
                        )}

                        {loadingThread && messages.length === 0 ? (
                          <div className="flex items-center gap-3 rounded-[26px] border border-stone-200 bg-white px-5 py-4 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-lime-200 bg-lime-50 text-lime-700">
                              <currentAgent.icon className="h-5 w-5" />
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 w-52 rounded-full bg-stone-100" />
                              <div className="h-3 w-72 rounded-full bg-stone-100" />
                            </div>
                          </div>
                        ) : messages.length === 0 ? (
                          <EmptyConversationState
                            agent={currentAgent}
                            onPrompt={(value) => {
                              setInput(value)
                              setTimeout(() => inputRef.current?.focus(), 40)
                            }}
                          />
                        ) : (
                          <>
                            {messages.map((bubble) => (
                              <MessageBubble key={bubble.id} bubble={bubble} />
                            ))}

                            {sending && (
                              <div className="flex w-full justify-start gap-3">
                                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-lime-200 bg-lime-50 text-lime-700 shadow-sm">
                                  <currentAgent.icon className="h-5 w-5" />
                                </div>
                                <div className="max-w-[78%] rounded-[28px] rounded-bl-md border border-stone-200 bg-white px-5 py-4 shadow-sm">
                                  <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-lime-500" />
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-lime-500 [animation-delay:120ms]" />
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-lime-500 [animation-delay:240ms]" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    <div className="border-t border-stone-200/80 bg-white/85 px-6 py-4 backdrop-blur-sm">
                      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                          {currentAgent.promptPills.map((pill) => (
                            <button
                              key={pill}
                              type="button"
                              onClick={() => {
                                setInput(pill)
                                setTimeout(() => inputRef.current?.focus(), 40)
                              }}
                              className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3.5 py-2 text-sm text-stone-700 transition hover:border-lime-300 hover:bg-lime-50 hover:text-lime-800"
                            >
                              <Sparkles className="h-4 w-4 text-lime-600" />
                              {pill}
                            </button>
                          ))}
                        </div>

                        <Separator className="bg-stone-200" />

                        <div className="flex items-end gap-3 rounded-[28px] border border-stone-200 bg-white px-3 py-3 shadow-sm">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 shrink-0 rounded-full border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100"
                            aria-label="Adjuntar"
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>

                          <Input
                            ref={inputRef}
                            value={input}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              setInput(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="Escribí tu mensaje..."
                            className="h-12 flex-1 border-0 bg-transparent px-2 text-[15px] shadow-none placeholder:text-stone-400 focus-visible:ring-0"
                            autoComplete="off"
                          />

                          <Button
                            type="button"
                            onClick={() => void handleSend()}
                            disabled={!input.trim() || sending}
                            className="h-12 w-12 shrink-0 rounded-full bg-lime-600 text-white shadow-md transition hover:bg-lime-700 disabled:opacity-50"
                            aria-label="Enviar mensaje"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[81] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-[0_18px_40px_-12px_rgba(107,142,35,0.65)] transition hover:scale-105 hover:bg-lime-700"
          aria-label="Abrir chat flotante"
        >
          <MessageCircle className="h-6 w-6" />
        </motion.button>
      )}
    </>
  )
}