// src/lib/agrocopilot.api.ts
import { requestJson } from "@/lib/http";
import type {
  DtcQuery,
  DtcResponse,
  FinancialSimulationInput,
  FinancialSimulationResponse,
  OrchestrationInput,
  OrchestrationResponse,
} from "@/lib/types";

export function healthCheck() {
  return requestJson<{ status: string; service: string }>("/api/v1/health", {
    method: "GET",
  });
}

export function diagnoseDtc(payload: DtcQuery) {
  return requestJson<DtcResponse>("/api/v1/rag/dtc", {
    method: "POST",
    body: payload,
  });
}

export function simulateFinance(payload: FinancialSimulationInput) {
  return requestJson<FinancialSimulationResponse>("/api/v1/finance/simulate", {
    method: "POST",
    body: payload,
  });
}

export function orchestrateNdvi(payload: OrchestrationInput) {
  return requestJson<OrchestrationResponse>("/api/v1/orchestrate/ndvi", {
    method: "POST",
    body: payload,
  });
}