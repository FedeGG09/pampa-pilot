export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type CropType = 'soja' | 'maiz' | 'trigo' | 'girasol' | 'algodon' | 'other'

export type ChatAgentType = 'agronomist' | 'finance' | 'machinery' | 'people_legal'
export type AgentKey = ChatAgentType

export interface DtcDiagnosisRequest {
  code: string
  equipment: string
  symptom: string
  context: string
}

export interface DtcDiagnosisResponse {
  diagnosis: string
  module: string
  severity: Severity
  confidence: number
  likely_causes: string[]
  immediate_actions: string[]
  corrective_actions: string[]
  stop_conditions: string[]
  notes: string
  source_refs: string[]
}

export interface FinanceSimulationRequest {
  area_ha: number
  yield_kg_ha: number
  price_usd_ton: number
  dex_rate_pct: number
  urea_kg_ha: number
  urea_price_usd_ton: number
  gasoil_l_ha: number
  gasoil_price_ars_l: number
  exchange_rate_ars_usd: number
}

export interface FinanceSimulationResponse {
  revenue_ars: number
  revenue_usd: number
  cost_ars: number
  margin_ars: number
  margin_usd: number
  delta_ars_vs_base: number
  delta_usd_vs_base: number
  recommendation: string
  assumptions: string[]
  notes: string
}

export interface OrchestratorAnalyzeRequest {
  ndvi: number
  location: {
    lat: number
    lng: number
    label?: string
  }
  crop: CropType
  lot_name?: string
}

export interface OrchestratorAnalyzeResponse {
  decision: 'agronomic' | 'financial' | 'monitor' | 'mixed'
  recommendation: string
  reason: string
  confidence: number
  suggested_flow: 'dtc' | 'finance' | 'none'
  next_actions: string[]
  summary: string
}

export interface SelectedLot {
  id: string
  name: string
  crop: CropType
  ndvi: number
  lat: number
  lng: number
  areaHa: number
}

export interface AppLogEntry {
  id: string
  ts: string
  level: 'info' | 'warn' | 'error'
  title: string
  detail: string
}

export interface AgronomistChatResponse {
  reply: string
}

/* ===== Dashboard / Home ===== */

export interface DashboardKpi {
  id: string
  label: string
  value: number | string
  delta?: number
  trend?: 'up' | 'down' | 'flat'
  subtitle?: string
  unit?: string
  icon?: string
  color?: string
}

export interface LotSummary {
  id: string
  name: string
  crop: CropType
  ndvi: number
  areaHa: number
  lat?: number
  lng?: number
  status?: string
  updatedAt?: string
}

export interface DashboardOverviewResponse {
  title?: string
  subtitle?: string
  kpis: DashboardKpi[]
  lots: LotSummary[]
  alerts: AppLogEntry[]
  generatedAt?: string
}

/* ===== Multiagent chat ===== */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface SupervisorChatRequest {
  user_id: string
  thread_id?: string | null
  message: string
  history: ChatMessage[]
  context: Record<string, unknown>
}

export interface SupervisorChatResponse {
  thread_id: string
  agent: ChatAgentType
  reply: string
  needs_clarification: boolean
  clarification_question: string | null
  llm_used: boolean
  llm_provider: string | null
  knowledge_topics: string[]
  tool_results: Record<string, unknown>
  conversation_title: string | null
}

export interface ConversationItem {
  thread_id: string
  user_id: string
  agent: ChatAgentType | string
  title: string | null
  summary: string | null
  updated_at: string | null
  turns: number
}

export interface ConversationSearchResponse {
  items: ConversationItem[]
}

export interface ConversationDetailResponse {
  thread_id: string
  user_id: string
  agent: ChatAgentType | string
  title: string | null
  summary: string | null
  updated_at: string | null
  messages: ChatMessage[]
}