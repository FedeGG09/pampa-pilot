import { useCallback, useRef, useState } from 'react'
import { sendAgronomistChat } from '@/lib/agronomist-chat'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
  pending?: boolean
}

function nowIso(): string {
  return new Date().toISOString()
}

function createMessage(role: ChatRole, content: string, pending = false): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: nowIso(),
    pending,
  }
}

const welcomeMessage =
  'Hola, soy Agronomist Chat. Puedo ayudarte a interpretar el lote, revisar señales, proponer próximos pasos y dejar una recomendación operativa para la campaña.'

export function useAgronomistChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([createMessage('assistant', welcomeMessage)])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isSending) return

    setError(null)
    setIsSending(true)

    const userMessage = createMessage('user', trimmed)
    const placeholder = createMessage('assistant', 'Escribiendo respuesta del asesor agrónomo…', true)

    setMessages((current) => [...current, userMessage, placeholder])

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const { reply } = await sendAgronomistChat({ message: trimmed }, controller.signal)

      setMessages((current) =>
        current.map((message) =>
          message.id === placeholder.id
            ? {
                ...message,
                content: reply,
                pending: false,
              }
            : message,
        ),
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo obtener respuesta'
      setError(message)
      setMessages((current) =>
        current.map((item) =>
          item.id === placeholder.id
            ? {
                ...item,
                content:
                  'No pude conectar con el Agronomist Chat en este momento. Revisá la API o intentá nuevamente en unos segundos.',
                pending: false,
              }
            : item,
        ),
      )
    } finally {
      setIsSending(false)
    }
  }, [isSending])

  const resetChat = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setMessages([createMessage('assistant', welcomeMessage)])
    setError(null)
    setIsSending(false)
  }, [])

  return {
    messages,
    isSending,
    error,
    sendMessage,
    resetChat,
  }
}
