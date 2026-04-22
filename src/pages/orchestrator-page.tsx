import { useMemo } from 'react'
import { useAppContext } from '@/context/app-context'
import { useOrchestratorAnalysis } from '@/hooks/useOrchestratorAnalysis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { formatPercent, ndviLabel } from '@/lib/utils'
import { useNavigate } from '@tanstack/react-router'

export function OrchestratorPage() {
  const { state, dispatch } = useAppContext()
  const { data, loading, error, run } = useOrchestratorAnalysis()
  const navigate = useNavigate()

  const lot = state.selectedLot

  const payload = useMemo(() => lot ? { ndvi: lot.ndvi, location: { lat: lot.lat, lng: lot.lng, label: lot.name }, crop: lot.crop, lot_name: lot.name } : null, [lot])

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader><CardTitle>Orquestador AI</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {lot ? (
            <div className="rounded-3xl border border-stone-100 bg-stone-50 p-4">
              <p className="text-sm text-stone-500">Lote seleccionado</p>
              <p className="mt-1 text-lg font-semibold">{lot.name}</p>
              <p className="text-sm text-stone-600">{lot.crop.toUpperCase()} · NDVI {lot.ndvi.toFixed(2)} · {ndviLabel(lot.ndvi)}</p>
            </div>
          ) : <Alert tone="info">Primero seleccioná un lote en el mapa.</Alert>}

          {error ? <Alert tone="danger">{error}</Alert> : null}

          <div className="grid gap-3">
            <Button disabled={!payload || loading} onClick={async () => {
              if (!payload) return
              const result = await run(payload)
              dispatch({ type: 'push_log', payload: { level: 'info', title: 'Orquestador analizó el lote', detail: `${result.decision} · confianza ${formatPercent(result.confidence, 0)}` } })
            }}>{loading ? 'Analizando...' : 'Ejecutar orquestación'}</Button>
            <Button variant="secondary" onClick={() => navigate({ to: '/mapa' })}>Volver al mapa</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recomendación final</CardTitle>
          {data ? <Badge variant={data.decision === 'financial' ? 'warning' : 'success'}>{data.decision}</Badge> : null}
        </CardHeader>
        <CardContent>
          {!data ? <Alert tone="info">La decisión final aparecerá aquí después del análisis.</Alert> : (
            <div className="space-y-4">
              <div className="rounded-3xl bg-stone-50 p-4"><p className="text-sm text-stone-500">Resumen</p><p className="mt-1 font-medium text-stone-900">{data.summary}</p></div>
              <div className="rounded-3xl bg-stone-50 p-4"><p className="text-sm text-stone-500">Motivo</p><p className="mt-1 text-sm text-stone-600">{data.reason}</p></div>
              <div className="rounded-3xl bg-stone-50 p-4"><p className="text-sm text-stone-500">Próximos pasos</p><ul className="mt-3 space-y-2 text-sm text-stone-600">{data.next_actions.map((item) => <li key={item} className="rounded-2xl bg-white px-3 py-2">{item}</li>)}</ul></div>
              <div className="grid gap-3 md:grid-cols-2">
                <Stat label="Confianza" value={formatPercent(data.confidence, 0)} />
                <Stat label="Flujo sugerido" value={data.suggested_flow.toUpperCase()} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-stone-50 p-4">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  )
}
