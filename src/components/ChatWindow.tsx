import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Bot, ChevronDown, Mic2, Send, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAgronomistChat } from '@/hooks/useAgronomistChat'

interface ChatWindowProps {
  open: boolean
  onClose: () => void
}

const suggestions = [
  '¿Qué acción priorizo en el lote activo?',
  'Resumí el estado del sistema y alertas.',
  'Dame una recomendación para esta campaña.',
]

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
  )
}

export function ChatWindow({ open, onClose }: ChatWindowProps) {
  const { messages, isSending, error, sendMessage, resetChat } = useAgronomistChat()
  const [inputValue, setInputValue] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const canSend = useMemo(() => inputValue.trim().length > 0 && !isSending, [inputValue, isSending])

  useEffect(() => {
    if (!open) return
    const node = endRef.current
    node?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isSending, open])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => window.clearTimeout(timer)
  }, [open])

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text || isSending) return
    setInputValue('')
    await sendMessage(text)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  const handleSuggestion = (text: string) => {
    setInputValue(text)
    inputRef.current?.focus()
  }

  return (
    <div
      className={cn(
        'fixed inset-x-3 bottom-20 z-50 origin-bottom-right transition-all duration-200 ease-out sm:inset-x-auto sm:bottom-6 sm:right-6',
        open ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-3 scale-95 opacity-0',
      )}
    >
      <div className="mx-auto flex w-[min(100vw-1.5rem,430px)] max-w-[430px] flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_24px_60px_rgba(22,45,19,0.22)] backdrop-blur-xl sm:w-[430px]">
        <div className="flex items-center justify-between gap-3 border-b border-stone-200/70 bg-[linear-gradient(135deg,rgba(235,246,230,0.95),rgba(255,255,255,0.95))] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-900">Agronomist Chat</div>
              <div className="text-xs text-stone-500">Asistente técnico del agro</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
              En línea
            </span>
            <button
              type="button"
              onClick={() => {
                resetChat()
                onClose()
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
              aria-label="Cerrar chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="border-b border-stone-200/60 bg-[linear-gradient(180deg,rgba(247,250,244,0.95),rgba(255,255,255,0.98))] px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Escribí una consulta breve y te respondo con foco operativo.
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSuggestion(item)}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-left text-[11px] font-medium text-stone-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="chat-scrollbar max-h-[52vh] min-h-[280px] overflow-y-auto px-4 py-4 sm:max-h-[60vh]">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex items-end gap-2', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[84%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                    message.role === 'user'
                      ? 'rounded-br-md bg-[var(--primary)] text-white'
                      : 'rounded-tl-md border border-stone-200/70 bg-white/95 text-stone-800',
                    message.pending && 'opacity-80',
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.pending && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400" />
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-[var(--primary)] text-white shadow-sm">
                    <span className="text-[11px] font-semibold">Yo</span>
                  </div>
                )}
              </div>
            ))}

            {isSending && <ChatBubbleSkeleton />}

            <div ref={endRef} />
          </div>
        </div>

        <div className="border-t border-stone-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,245,0.98))] p-4">
          {error && (
            <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}

          <div className="flex items-end gap-2 rounded-[22px] border border-stone-200 bg-white p-2 shadow-sm">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Escribí tu consulta agronómica..."
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
              <Mic2 className="h-3.5 w-3.5" />
              POST /agronomist/chat
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
