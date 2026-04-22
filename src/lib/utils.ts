import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

export function formatCurrencyARS(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCurrencyUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function pseudoNdviFromCoordinates(lat: number, lng: number): number {
  const raw = Math.sin(lat * 12.9898) * Math.cos(lng * 78.233) * 43758.5453
  const frac = raw - Math.floor(raw)
  return clamp(0.25 + frac * 0.55, 0.15, 0.92)
}

export function ndviLabel(ndvi: number): string {
  if (ndvi >= 0.78) return 'Excelente'
  if (ndvi >= 0.62) return 'Bueno'
  if (ndvi >= 0.48) return 'Medio'
  if (ndvi >= 0.35) return 'Bajo'
  return 'Crítico'
}

export function nowIso(): string {
  return new Date().toISOString()
}
