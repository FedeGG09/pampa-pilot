export type AgentId = 'agronomist' | 'finance' | 'machinery' | 'people_legal';
export type ChatRole = 'user' | 'assistant' | 'system';

export interface Agent {
  id: AgentId;
  name: string;
  description: string;
  image: string;
  accentClass: string;
}

export interface Message {
  id: string;
  agentId: AgentId;
  role: ChatRole;
  content: string;
  createdAt: string;
  pending?: boolean;
  error?: boolean;
}

export interface ChatHistoryItem {
  role: ChatRole;
  content: string;
}

export interface ApiResponse {
  reply?: string;
  answer?: string;
  summary?: string;
  recommendation?: string;
  note?: string;
  message?: string;
  needs_clarification?: boolean;
  clarification_question?: string | null;
  [key: string]: unknown;
}

export interface ConversationSearchItem {
  id: string;
  title?: string;
  preview?: string;
  agentId?: AgentId;
  updatedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface SearchConversationsResponse {
  results?: ConversationSearchItem[];
  items?: ConversationSearchItem[];
  conversations?: ConversationSearchItem[];
  [key: string]: unknown;
}