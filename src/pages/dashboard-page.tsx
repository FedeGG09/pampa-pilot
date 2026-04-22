import { Activity, MapPinned, Radar, TrendingUp, TriangleAlert } from 'lucide-react'
import { MetricCard } from '@/components/ui/metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/app-context'
import { formatNumber, formatPercent, ndviLabel } from '@/lib/utils'
import { Link } from '@tanstack/react-router'

export function DashboardPage() {
  const { state } = useAppContext()
  const lot = state.selectedLot

  const ndvi = lot?.ndvi ?? 0
  const area = lot?.areaHa ?? 0
  const summaryText = lot ? `${lot.name} · ${lot.crop.toUpperCase()} · ${ndviLabel(lot.ndvi)}` : 'Aún no hay un lote activo. Seleccioná uno en el mapa para empezar.'

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Lote activo" value={lot ? '1' : '0'} delta={lot ? lot.name : 'Sin selección'} icon={<MapPinned className="h-5 w-5" />} footer={summaryText} />
        <MetricCard title="Superficie activa" value={lot ? `${formatNumber(area)} ha` : '—'} delta={lot ? `${formatPercent(1, 0)} del lote seleccionado` : 'Esperando selección'} icon={<Activity className="h-5 w-5" />} />
        <MetricCard title="NDVI promedio" value={lot ? ndvi.toFixed(2) : '—'} delta={lot ? ndviLabel(ndvi) : 'Sin análisis'} icon={<Radar className="h-5 w-5" />} tone={lot && ndvi >= 0.62 ? 'good' : lot && ndvi >= 0.45 ? 'warn' : 'danger'} />
        <MetricCard title="Señal operativa" value={state.logs.length ? `${state.logs.length}` : '0'} delta={state.logs.length ? 'Eventos recientes' : 'Sin eventos'} icon={<TrendingUp className="h-5 w-5" />} />
        <MetricCard title="Alertas" value={state.logs.filter((log) => log.level !== 'info').length.toString()} delta="Técnicas / financieras" icon={<TriangleAlert className="h-5 w-5" />} tone={state.logs.some((l) => l.level !== 'info') ? 'warn' : 'neutral'} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="min-h-[420px]">
          <CardHeader>
            <div>
              <CardTitle>Mapa operativo</CardTitle>
              <p className="mt-1 text-sm text-stone-500">Integra selección de lote, NDVI y decisión asistida por IA.</p>
            </div>
            <Badge variant={lot ? 'success' : 'neutral'}>{lot ? 'Activo' : 'Sin datos'}</Badge>
          </CardHeader>
          <CardContent>
            <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 p-6">
              <p className="text-sm text-stone-500">La vista completa está disponible en <Link to="/mapa" className="font-semibold text-[var(--primary)]">Mapa de Lotes</Link>.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Button asChild><Link to="/orquestador">Ir al Orquestador AI</Link></Button>
                <Button variant="secondary" asChild><Link to="/dtc">Abrir Asesor Técnico</Link></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Estado del sistema</CardTitle>
              <p className="mt-1 text-sm text-stone-500">Historial reciente de acciones y respuestas.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.logs.length === 0 ? (
              <Alert tone="info">Todavía no hay eventos registrados. Seleccioná un lote y ejecutá una acción.</Alert>
            ) : (
              state.logs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-stone-100 bg-stone-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{log.title}</p>
                    <Badge variant={log.level === 'error' ? 'danger' : log.level === 'warn' ? 'warning' : 'neutral'}>{log.level}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-stone-600">{log.detail}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
