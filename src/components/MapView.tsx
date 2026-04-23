import { useMemo } from 'react'
import {
  MapContainer,
  Polygon,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet'
import type { CropType, SelectedLot } from '@/types/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { clamp, ndviLabel, pseudoNdviFromCoordinates } from '@/lib/utils'

interface MapViewProps {
  selectedLot: SelectedLot | null
  onSelectLot: (lot: SelectedLot) => void
  onAnalyze: () => void
}

function MapClickHandler({
  onSelectLot,
}: {
  onSelectLot: MapViewProps['onSelectLot']
}) {
  useMapEvents({
    click(e) {
      const ndvi = pseudoNdviFromCoordinates(e.latlng.lat, e.latlng.lng)
      const areaHa = clamp(
        80 + Math.round(Math.abs(e.latlng.lat * e.latlng.lng) % 220),
        40,
        320,
      )

      const crops: CropType[] = ['soja', 'maiz', 'trigo', 'girasol']
      const cropIndex =
        Math.abs(Math.floor((e.latlng.lat + e.latlng.lng) * 10)) % crops.length

      const fallbackCrop: CropType = 'soja'
      const crop: CropType = crops[cropIndex] ?? fallbackCrop

      onSelectLot({
        id: crypto.randomUUID(),
        name: `Lote ${Math.abs(Math.round(e.latlng.lat * 10))}-${Math.abs(
          Math.round(e.latlng.lng * 10),
        )}`,
        crop,
        ndvi,
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        areaHa,
      })
    },
  })

  return null
}

function lotPolygon(lat: number, lng: number) {
  const deltaLat = 0.18
  const deltaLng = 0.24

  return [
    [lat - deltaLat, lng - deltaLng],
    [lat - deltaLat * 0.25, lng + deltaLng],
    [lat + deltaLat, lng + deltaLng * 0.25],
    [lat + deltaLat * 0.85, lng - deltaLng * 0.85],
  ] as [number, number][]
}

function ndviColor(ndvi: number): string {
  if (ndvi >= 0.78) return '#4F7B1F'
  if (ndvi >= 0.62) return '#91B63D'
  if (ndvi >= 0.48) return '#D8C94B'
  if (ndvi >= 0.35) return '#F29A36'
  return '#D94B3D'
}

export function MapView({
  selectedLot,
  onSelectLot,
  onAnalyze,
}: MapViewProps) {
  const center = useMemo(() => ({ lat: -34.6, lng: -61.4 }), [])

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
      <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Mapa operativo</h2>
            <p className="text-sm text-stone-500">
              Click sobre Argentina para crear un lote y simular NDVI.
            </p>
          </div>
          <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            {selectedLot ? ndviLabel(selectedLot.ndvi) : 'Sin lote seleccionado'}
          </Badge>
        </div>

        <div className="h-[640px]">
          <MapContainer center={center} zoom={5} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onSelectLot={onSelectLot} />

            {selectedLot && (
              <Polygon
                positions={lotPolygon(selectedLot.lat, selectedLot.lng)}
                pathOptions={{
                  color: ndviColor(selectedLot.ndvi),
                  fillColor: ndviColor(selectedLot.ndvi),
                  fillOpacity: 0.35,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="space-y-1">
                    <div className="font-semibold">{selectedLot.name}</div>
                    <div>NDVI: {selectedLot.ndvi.toFixed(2)}</div>
                    <div>Cultivo: {selectedLot.crop}</div>
                    <div>Área estimada: {selectedLot.areaHa} ha</div>
                  </div>
                </Popup>
              </Polygon>
            )}
          </MapContainer>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-stone-900">Lote activo</h3>

          {selectedLot ? (
            <div className="mt-4 space-y-3 text-sm text-stone-700">
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Nombre
                </div>
                <div className="mt-1 font-medium">{selectedLot.name}</div>
              </div>

              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  NDVI
                </div>
                <div className="mt-1 font-medium">{selectedLot.ndvi.toFixed(2)}</div>
              </div>

              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Cultivo
                </div>
                <div className="mt-1 font-medium">{selectedLot.crop}</div>
              </div>

              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Superficie
                </div>
                <div className="mt-1 font-medium">{selectedLot.areaHa} ha</div>
              </div>

              <Button
                onClick={onAnalyze}
                className="mt-2 w-full rounded-2xl bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
              >
                Analizar lote
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-stone-500">
              Seleccioná un punto en el mapa para generar un lote y disparar el análisis.
            </p>
          )}
        </section>

        <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-stone-900">NDVI overlay</h3>
          <p className="mt-2 text-sm text-stone-500">
            El color del lote se recalcula al clickear en el mapa. El resultado alimenta
            el Orquestador AI.
          </p>

          <div className="mt-4 space-y-2 text-sm text-stone-700">
            {[
              ['0.15', '#D94B3D'],
              ['0.35', '#F29A36'],
              ['0.48', '#D8C94B'],
              ['0.62', '#91B63D'],
              ['0.78', '#4F7B1F'],
            ].map(([label, color]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  )
}