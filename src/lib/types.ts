// src/lib/types.ts
export type DtcSeverity = "Crítica" | "Alta" | "Media" | "Baja";
export type RiskLevel = "Bajo" | "Medio" | "Alto" | "Crítico";
export type RecommendationAction =
  | "comprar_insumos"
  | "cubrir_ventas"
  | "mantener_posicion"
  | "postergar_decision";

export interface DtcQuery {
  code: string;
  equipment?: string | null;
  symptom?: string | null;
  context?: string | null;
}

export interface DtcResponse {
  code: string;
  module: string;
  diagnosis: string;
  severity: DtcSeverity;
  likely_causes: string[];
  immediate_actions: string[];
  corrective_actions: string[];
  stop_conditions: string[];
  source_refs: string[];
  confidence: number;
  notes: string;
}

export interface FinancialSimulationInput {
  crop: "soja" | "maiz" | "trigo" | "girasol" | "sorgo";
  price_ars_ton: string;
  yield_qq_ha: string;
  old_dex_pct: string;
  new_dex_pct: string;
  fx_ars_usd?: string;
  urea_price_usd_ton?: string;
  urea_shock_pct?: string;
  urea_applied_kg_ha?: string;
  gasoil_price_usd_l?: string;
  gasoil_shock_pct?: string;
  gasoil_use_l_ha?: string;
  other_costs_ars_ha?: string;
}

export interface FinancialBreakdown {
  gross_revenue_ars_ha: string;
  net_revenue_old_dex_ars_ha: string;
  net_revenue_new_dex_ars_ha: string;
  dex_gain_ars_ha: string;
  urea_cost_delta_ars_ha: string;
  gasoil_cost_delta_ars_ha: string;
  other_costs_ars_ha: string;
  total_cost_delta_ars_ha: string;
  net_impact_ars_ha: string;
  net_impact_usd_ha: string;
}

export interface FinancialSimulationResponse {
  crop: string;
  fx_ars_usd: string;
  recommended_action: RecommendationAction;
  risk_level: RiskLevel;
  breakdown: FinancialBreakdown;
  rationale: string;
  assumptions: string[];
}

export interface NDVIReport {
  field_name: string;
  ndvi_mean: number;
  ndvi_delta_vs_history: number;
  biomass_variability: number;
  soil_hint?: string | null;
  crop?: string | null;
}

export interface OrchestrationInput {
  ndvi_report: NDVIReport;
  market_pressure?: boolean;
  expected_margin_usd_ha?: string;
  crop_price_ars_ton?: string;
  yield_qq_ha?: string;
  old_dex_pct?: string;
  new_dex_pct?: string;
  urea_price_usd_ton?: string;
  urea_shock_pct?: string;
  gasoil_price_usd_l?: string;
  gasoil_shock_pct?: string;
}

export interface SoilSeriesRecommendation {
  recommended_series: "Pergamino" | "Solís";
  confidence: number;
  rationale: string;
  key_factors: string[];
}

export interface OrchestrationResponse {
  route_taken: "soil" | "finance" | "both";
  recommendation: string;
  soil?: SoilSeriesRecommendation | null;
  finance?: FinancialSimulationResponse | null;
  next_step: string;
}