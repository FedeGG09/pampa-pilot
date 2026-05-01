import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import ChatWindow from '@/components/ChatWindow';
import type { AgentId, OpenChatEventDetail } from '@/types/chat';

const OPEN_EVENT = 'agrocopilot:open-chat';
const CLOSE_EVENT = 'agrocopilot:close-chat';

export default function ChatFloatingButton() {
  const [open, setOpen] = useState(false);
  const [initialAgentId, setInitialAgentId] = useState<AgentId>('agronomist');
  const [initialConversationId, setInitialConversationId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const customEvent = event as CustomEvent<OpenChatEventDetail>;
      if (customEvent.detail?.agentId) {
        setInitialAgentId(customEvent.detail.agentId);
      }
      setInitialConversationId(customEvent.detail?.conversationId);
      setOpen(true);
    };

    const handleClose = () => setOpen(false);

    window.addEventListener(OPEN_EVENT, handleOpen as EventListener);
    window.addEventListener(CLOSE_EVENT, handleClose);

    return () => {
      window.removeEventListener(OPEN_EVENT, handleOpen as EventListener);
      window.removeEventListener(CLOSE_EVENT, handleClose);
    };
  }, []);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-6 right-6 z-[60] inline-flex items-center gap-3 rounded-full border border-[var(--primary)] bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/15 transition hover:brightness-110 active:brightness-95"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileTap={{ scale: 0.98 }}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span className="hidden sm:inline">
          {open ? 'Cerrar chat' : 'AgroCopilot AI'}
        </span>
      </motion.button>

      <ChatWindow
        open={open}
        onClose={() => setOpen(false)}
        initialAgentId={initialAgentId}
        initialConversationId={initialConversationId}
      />
    </>
  );
}