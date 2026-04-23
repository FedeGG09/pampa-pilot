export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type CropType = 'soja' | 'maiz' | 'trigo' | 'girasol' | 'algodon' | 'other'
export type DecisionType = 'agronomic' | 'financial' | 'monitor' | 'mixed'
export type SuggestedFlow = 'dtc' | 'finance' | 'none'

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
  decision: DecisionType
  recommendation: string
  reason: string
  confidence: number
  suggested_flow: SuggestedFlow
  next_actions: string[]
  summary: string
}

export interface KPI {
  label: string
  value: string
  unit: string
  delta: string
  positive: boolean
}

export interface ChartPoint {
  label: string
  realized: number
  projected: number
}

export interface Climate {
  ubicacion: string
  temp: number
  condicion: string
  humedad: number
  viento: number
  pronostico: string
}

export interface MarketQuote {
  producto: string
  precio: string
  unidad: string
  delta: string
}

export interface MachineAlert {
  titulo: string
  subtitle: string
  severity: Severity
  confidence: number
  progress: number
  action: string
}

export interface LotSummary {
  id: string
  nombre: string
  cultivo: CropType
  hectareas: number
  rinde: number
  ndvi: number
  humedad: number
}

export interface DashboardOverviewResponse {
  generated_at: string
  kpis: KPI[]
  chart: ChartPoint[]
  clima: Climate
  pizarra_rosario: MarketQuote[]
  machine_alert: MachineAlert
  recent_lots: LotSummary[]
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