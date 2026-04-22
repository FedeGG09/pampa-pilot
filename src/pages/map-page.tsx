import { useAppContext } from '@/context/app-context'
import { MapView } from '@/components/MapView'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ndviLabel, formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

export function MapPage() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="space-y-4">
        <MapView
          selectedLot={state.selectedLot}
          onSelectLot={(lot) => {
            dispatch({ type: 'select_lot', payload: lot })
            dispatch({ type: 'push_log', payload: { level: 'info', title: 'Lote seleccionado', detail: `${lot.name} · ${lot.crop.toUpperCase()} · NDVI ${lot.ndvi.toFixed(2)}` } })
          }}
          onAnalyze={() => navigate({ to: '/orquestador' })}
        />
      </section>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Detalle del lote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!state.selectedLot ? (
              <Alert tone="info">Seleccioná cualquier punto del mapa para crear un lote operativo.</Alert>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{state.selectedLot.name}</p>
                    <p className="text-sm text-stone-500">{state.selectedLot.crop.toUpperCase()}</p>
                  </div>
                  <Badge variant={state.selectedLot.ndvi >= 0.62 ? 'success' : 'warning'}>{ndviLabel(state.selectedLot.ndvi)}</Badge>
                </div>

                <div className="grid gap-3 rounded-2xl bg-stone-50 p-4 text-sm">
                  <div className="flex items-center justify-between"><span className="text-stone-500">NDVI</span><span className="font-semibold">{state.selectedLot.ndvi.toFixed(2)}</span></div>
                  <div className="flex items-center justify-between"><span className="text-stone-500">Área estimada</span><span className="font-semibold">{formatNumber(state.selectedLot.areaHa)} ha</span></div>
                  <div className="flex items-center justify-between"><span className="text-stone-500">Coordenadas</span><span className="font-semibold">{state.selectedLot.lat.toFixed(4)}, {state.selectedLot.lng.toFixed(4)}</span></div>
                </div>

                <Button className="w-full" onClick={() => navigate({ to: '/orquestador' })}>Enviar al Orquestador AI</Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flujo recomendado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-stone-600">
            <p>1. Elegir lote en el mapa.</p>
            <p>2. Evaluar NDVI y contexto del cultivo.</p>
            <p>3. Derivar a diagnóstico técnico o simulación económica.</p>
            <p>4. Confirmar recomendación final en el Orquestador.</p>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
