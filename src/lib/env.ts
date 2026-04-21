// src/lib/env.ts
export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  APP_NAME: import.meta.env.VITE_APP_NAME ?? "AgroCopilot AI",
} as const;