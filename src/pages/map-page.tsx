import { useAppContext } from '@/context/app-context'
import { MapView } from '@/components/MapView'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useOrchestratorAnalysis } from '@/hooks/useOrchestratorAnalysis'
import { formatNumber, formatPercent, ndviLabel } from '@/lib/utils'

export function MapPage() {
  const { state, dispatch } = useAppContext()
  const orchestrator = useOrchestratorAnalysis()

  const handleSelectLot = (lot: typeof state.selectedLot) => {
    dispatch({ type: 'select_lot', payload: lot })

    if (lot) {
      dispatch({
        type: 'push_log',
        payload: {
          level: 'info',
          title: 'Lote seleccionado',
          detail: `${lot.name} · ${lot.crop.toUpperCase()} · NDVI ${lot.ndvi.toFixed(2)}`,
        },
      })
    }
  }

  const handleAnalyze = async () => {
    if (!state.selectedLot) return

    const result = await orchestrator.run({
      ndvi: state.selectedLot.ndvi,
      location: {
        lat: state.selectedLot.lat,
        lng: state.selectedLot.lng,
        label: state.selectedLot.name,
      },
      crop: state.selectedLot.crop,
      lot_name: state.selectedLot.name,
    })

    dispatch({
      type: 'push_log',
      payload: {
        level: 'info',
        title: 'Orquestador AI ejecutado',
        detail: `${result.decision} · confianza ${formatPercent(result.confidence, 0)}`,
      },
    })
  }

  return (
    <div className="space-y-6">
      <MapView
        selectedLot={state.selectedLot}
        onSelectLot={handleSelectLot}
        onAnalyze={() => void handleAnalyze()}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[28px] border-stone-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Detalle del lote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!state.selectedLot ? (
              <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                Seleccioná cualquier punto del mapa para crear un lote operativo.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-stone-500">Nombre</div>
                    <div className="text-xl font-semibold text-stone-900">
                      {state.selectedLot.name}
                    </div>
                  </div>
                  <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                    {ndviLabel(state.selectedLot.ndvi)}
                  </Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <div className="text-sm text-stone-500">Cultivo</div>
                    <div className="mt-1 font-semibold text-stone-900">
                      {state.selectedLot.crop.toUpperCase()}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <div className="text-sm text-stone-500">NDVI</div>
                    <div className="mt-1 font-semibold text-stone-900">
                      {state.selectedLot.ndvi.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <div className="text-sm text-stone-500">Área estimada</div>
                    <div className="mt-1 font-semibold text-stone-900">
                      {formatNumber(state.selectedLot.areaHa, 1)} ha
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                  Coordenadas {state.selectedLot.lat.toFixed(4)},{' '}
                  {state.selectedLot.lng.toFixed(4)}
                </div>

                <Button
                  onClick={() => void handleAnalyze()}
                  disabled={orchestrator.loading}
                  className="rounded-2xl bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                >
                  {orchestrator.loading ? 'Analizando...' : 'Enviar al Orquestador AI'}
                </Button>

                {orchestrator.error && (
                  <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                    {orchestrator.error}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-stone-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Resultado de orquestación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!orchestrator.data ? (
              <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                La decisión final aparecerá aquí después del análisis.
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-stone-50 p-4">
                  <div className="text-sm uppercase tracking-[0.18em] text-stone-500">
                    Recomendación
                  </div>
                  <div className="mt-1 text-lg font-semibold text-stone-900">
                    {orchestrator.data.recommendation}
                  </div>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4">
                  <div className="text-sm uppercase tracking-[0.18em] text-stone-500">
                    Motivo
                  </div>
                  <div className="mt-1 text-sm text-stone-700">
                    {orchestrator.data.reason}
                  </div>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4">
                  <div className="text-sm uppercase tracking-[0.18em] text-stone-500">
                    Confianza
                  </div>
                  <div className="mt-1 text-lg font-semibold text-stone-900">
                    {formatPercent(orchestrator.data.confidence, 0)}
                  </div>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4">
                  <div className="text-sm uppercase tracking-[0.18em] text-stone-500">
                    Próximos pasos
                  </div>
                  <ul className="mt-2 space-y-2 text-sm text-stone-700">
                    {orchestrator.data.next_actions.map((item) => (
                      <li key={item} className="rounded-2xl bg-white px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}