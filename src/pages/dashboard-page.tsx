import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Cloud,
  Droplets,
  MapPinned,
  Radar,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Wind,
} from 'lucide-react'
import { MetricCard } from '@/components/ui/metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/app-context'
import { fetchDashboardOverview } from '@/lib/api'
import { formatNumber, formatPercent, ndviLabel } from '@/lib/utils'
import { useDtcDiagnosis } from '@/hooks/useDtcDiagnosis'
import { useFinanceSimulation } from '@/hooks/useFinanceSimulation'
import { useOrchestratorAnalysis } from '@/hooks/useOrchestratorAnalysis'
import type {
  CropType,
  DashboardOverviewResponse,
  LotSummary,
  SelectedLot,
} from '@/types/api'

function lotToSelectedLot(lot: LotSummary): SelectedLot {
  return {
    id: lot.id,
    name: lot.nombre,
    crop: lot.cultivo,
    ndvi: lot.ndvi,
    lat: -34.6,
    lng: -61.4,
    areaHa: lot.hectareas,
  }
}

function defaultYieldKgHa(crop: CropType): number {
  switch (crop) {
    case 'maiz':
      return 9200
    case 'trigo':
      return 3800
    case 'girasol':
      return 2600
    case 'algodon':
      return 2500
    case 'soja':
    case 'other':
    default:
      return 3400
  }
}

function defaultPriceUsdTon(crop: CropType): number {
  switch (crop) {
    case 'maiz':
      return 195
    case 'trigo':
      return 230
    case 'girasol':
      return 360
    case 'algodon':
      return 550
    case 'soja':
    case 'other':
    default:
      return 340
  }
}

export function DashboardPage() {
  const { state, dispatch } = useAppContext()
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dtc = useDtcDiagnosis()
  const finance = useFinanceSimulation()
  const orchestrator = useOrchestratorAnalysis()

  useEffect(() => {
    let alive = true

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchDashboardOverview()
        if (alive) setOverview(data)
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Error cargando dashboard')
        }
      } finally {
        if (alive) setLoading(false)
      }
    }

    void load()

    return () => {
      alive = false
    }
  }, [])

  const activeLot = useMemo(() => {
    if (state.selectedLot) return state.selectedLot
    const fallback = overview?.recent_lots?.[0]
    return fallback ? lotToSelectedLot(fallback) : null
  }, [overview, state.selectedLot])

  const handleQuickDtc = async () => {
    if (!activeLot) return

    const result = await dtc.run({
      code: '000107.00',
      equipment: 'John Deere S780',
      symptom: `Revisión rápida sobre ${activeLot.name}`,
      context: `Lote ${activeLot.name} · ${activeLot.crop.toUpperCase()} · NDVI ${activeLot.ndvi.toFixed(
        2,
      )}`,
    })

    dispatch({
      type: 'push_log',
      payload: {
        level:
          result.severity === 'critical' || result.severity === 'high' ? 'warn' : 'info',
        title: 'Diagnóstico técnico emitido',
        detail: `${result.module} · confianza ${formatPercent(result.confidence, 0)}`,
      },
    })
  }

  const handleQuickFinance = async () => {
    if (!activeLot) return

    const result = await finance.run({
      area_ha: activeLot.areaHa,
      yield_kg_ha: defaultYieldKgHa(activeLot.crop),
      price_usd_ton: defaultPriceUsdTon(activeLot.crop),
      dex_rate_pct: 12,
      urea_kg_ha: activeLot.crop === 'maiz' ? 90 : 60,
      urea_price_usd_ton: 550,
      gasoil_l_ha: 18,
      gasoil_price_ars_l: 1200,
      exchange_rate_ars_usd: 1368,
    })

    dispatch({
      type: 'push_log',
      payload: {
        level: 'info',
        title: 'Simulación financiera ejecutada',
        detail: `Margen ARS ${formatNumber(result.margin_ars, 0)}`,
      },
    })
  }

  const handleQuickAnalyze = async () => {
    if (!activeLot) return

    const result = await orchestrator.run({
      ndvi: activeLot.ndvi,
      location: {
        lat: activeLot.lat,
        lng: activeLot.lng,
        label: activeLot.name,
      },
      crop: activeLot.crop,
      lot_name: activeLot.name,
    })

    dispatch({
      type: 'push_log',
      payload: {
        level: 'info',
        title: 'Orquestador analizó el lote',
        detail: `${result.decision} · confianza ${formatPercent(result.confidence, 0)}`,
      },
    })
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-6 text-sm text-stone-600 shadow-sm">
        Cargando dashboard operativo...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {overview?.kpis.map((kpi) => (
          <MetricCard
            key={kpi.label}
            title={kpi.label}
            value={`${kpi.value}${kpi.unit ? ` ${kpi.unit}` : ''}`}
            delta={kpi.delta}
            tone={kpi.positive ? 'good' : 'danger'}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="rounded-[28px] border-stone-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-[var(--primary)]" />
              Clima operativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-stone-500">{overview?.clima.ubicacion}</p>
                <h3 className="text-2xl font-semibold text-stone-900">
                  {overview?.clima.temp}°C
                </h3>
              </div>
              <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                {overview?.clima.condicion}
              </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-stone-50 p-4">
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <Droplets className="h-4 w-4" />
                  Humedad
                </div>
                <div className="mt-2 text-2xl font-semibold text-stone-900">
                  {overview?.clima.humedad}%
                </div>
              </div>
              <div className="rounded-2xl bg-stone-50 p-4">
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <Wind className="h-4 w-4" />
                  Viento
                </div>
                <div className="mt-2 text-2xl font-semibold text-stone-900">
                  {overview?.clima.viento} km/h
                </div>
              </div>
              <div className="rounded-2xl bg-stone-50 p-4">
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <Radar className="h-4 w-4" />
                  NDVI foco
                </div>
                <div className="mt-2 text-2xl font-semibold text-stone-900">
                  {activeLot ? ndviLabel(activeLot.ndvi) : 'Sin lote'}
                </div>
              </div>
            </div>

            <p className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
              {overview?.clima.pronostico}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-stone-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--primary)]" />
              Acciones rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => void handleQuickAnalyze()}
              className="w-full rounded-2xl bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
              disabled={!activeLot || orchestrator.loading}
            >
              {orchestrator.loading ? 'Analizando...' : 'Analizar lote destacado'}
            </Button>
            <Button
              onClick={() => void handleQuickFinance()}
              variant="secondary"
              className="w-full rounded-2xl border-stone-200 bg-white"
              disabled={!activeLot || finance.loading}
            >
              {finance.loading ? 'Simulando...' : 'Simular impacto financiero'}
            </Button>
            <Button
              onClick={() => void handleQuickDtc()}
              variant="secondary"
              className="w-full rounded-2xl border-stone-200 bg-white"
              disabled={!activeLot || dtc.loading}
            >
              {dtc.loading ? 'Diagnosticando...' : 'Lanzar diagnóstico técnico'}
            </Button>

            <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
              {activeLot ? (
                <>
                  <div className="font-medium text-stone-900">{activeLot.name}</div>
                  <div className="mt-1">
                    {activeLot.crop.toUpperCase()} · NDVI {activeLot.ndvi.toFixed(2)}
                  </div>
                </>
              ) : (
                <div>No hay lote activo todavía.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[28px] border-stone-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
              Pizarra Rosario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview?.pizarra_rosario.map((item) => (
              <div
                key={item.producto}
                className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3"
              >
                <div>
                  <div className="font-medium text-stone-900">{item.producto}</div>
                  <div className="text-sm text-stone-500">{item.unidad}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-stone-900">{item.precio}</div>
                  <div className="text-sm text-emerald-700">{item.delta}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-stone-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-[var(--primary)]" />
              Lotes recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview?.recent_lots.map((lot) => (
              <div key={lot.id} className="rounded-2xl bg-stone-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-stone-900">{lot.nombre}</div>
                  <Badge className="rounded-full bg-white text-stone-700 hover:bg-white">
                    NDVI {lot.ndvi.toFixed(2)}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-stone-500">
                  {lot.cultivo.toUpperCase()} · {formatNumber(lot.hectareas, 1)} ha ·{' '}
                  {formatNumber(lot.rinde, 1)} qq/ha
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[28px] border-stone-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-amber-600" />
            Alerta de maquinaria
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl bg-stone-50 p-4">
            <div className="text-sm uppercase tracking-[0.18em] text-stone-500">
              {overview?.machine_alert.titulo}
            </div>
            <div className="mt-1 text-lg font-semibold text-stone-900">
              {overview?.machine_alert.subtitle}
            </div>
            <p className="mt-3 text-sm text-stone-600">
              Recomendación: {overview?.machine_alert.action}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
            <MetricCard
              title="Severidad"
              value={overview?.machine_alert.severity ?? 'low'}
              tone={
                overview?.machine_alert.severity === 'critical' ||
                overview?.machine_alert.severity === 'high'
                  ? 'danger'
                  : overview?.machine_alert.severity === 'medium'
                    ? 'warn'
                    : 'good'
              }
            />
            <MetricCard
              title="Confianza"
              value={formatPercent(overview?.machine_alert.confidence ?? 0, 0)}
              tone="neutral"
            />
            <MetricCard
              title="Progreso"
              value={`${overview?.machine_alert.progress ?? 0}%`}
              tone="neutral"
            />
          </div>
        </CardContent>
      </Card>

      {state.logs.length > 0 && (
        <Card className="rounded-[28px] border-stone-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[var(--primary)]" />
              Historial reciente de acciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.logs.map((log) => (
              <div key={log.id} className="rounded-2xl bg-stone-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-stone-900">{log.title}</div>
                  <Badge className="rounded-full bg-white text-stone-700 hover:bg-white">
                    {log.level}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-stone-500">{log.detail}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}