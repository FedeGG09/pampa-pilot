import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageCircle } from 'lucide-react'
import { sendAgronomistChat } from '@/lib/api'
import { cn } from '@/lib/utils'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatFloatingButton() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await sendAgronomistChat(userMessage.content)

      const botMessage: Message = {
        role: 'assistant',
        content: res.reply ?? 'Sin respuesta del agrónomo',
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error al conectar con el agrónomo.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg transition hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white/90 shadow-2xl backdrop-blur-xl md:w-[380px]"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Agronomist AI</p>
                <p className="text-xs text-stone-500">
                  Asistente técnico del campo
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* MENSAJES */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="text-sm text-stone-400">
                  Preguntá sobre rindes, clima, suelo o decisiones agronómicas.
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                    msg.role === 'user'
                      ? 'ml-auto bg-[var(--primary)] text-white'
                      : 'bg-stone-100 text-stone-800',
                  )}
                >
                  {msg.content}
                </div>
              ))}

              {/* LOADING */}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:0.2s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:0.4s]" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="flex items-center gap-2 border-t border-stone-200 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribí tu consulta..."
                className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />

              <button
                onClick={handleSend}
                disabled={loading}
                className="rounded-xl bg-[var(--primary)] p-2 text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}