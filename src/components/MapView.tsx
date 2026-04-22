import { MapContainer, Polygon, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useMemo } from 'react'
import type { SelectedLot, CropType } from '@/types/api'
import { pseudoNdviFromCoordinates, ndviLabel, clamp } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface MapViewProps {
  selectedLot: SelectedLot | null
  onSelectLot: (lot: SelectedLot) => void
  onAnalyze: () => void
}

function MapClickHandler({ onSelectLot }: { onSelectLot: MapViewProps['onSelectLot'] }) {
  useMapEvents({
    click(e) {
      const ndvi = pseudoNdviFromCoordinates(e.latlng.lat, e.latlng.lng)
      const areaHa = clamp(80 + Math.round(Math.abs(e.latlng.lat * e.latlng.lng) % 220), 40, 320)
      const crops: CropType[] = ['soja', 'maiz', 'trigo', 'girasol']
      const crop = crops[Math.abs(Math.floor((e.latlng.lat + e.latlng.lng) * 10)) % crops.length]
      onSelectLot({
        id: crypto.randomUUID(),
        name: `Lote ${Math.abs(Math.round(e.latlng.lat * 10))}-${Math.abs(Math.round(e.latlng.lng * 10))}`,
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

export function MapView({ selectedLot, onSelectLot, onAnalyze }: MapViewProps) {
  const center = useMemo(() => ({ lat: -34.6, lng: -61.4 }), [])

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_10px_30px_rgba(78,54,45,0.08)]">
        <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3">
          <div>
            <h3 className="text-base font-semibold">Mapa operativo</h3>
            <p className="text-sm text-stone-500">Click sobre Argentina para crear un lote y simular NDVI.</p>
          </div>
          {selectedLot ? <Badge variant="success">{ndviLabel(selectedLot.ndvi)}</Badge> : <Badge variant="neutral">Sin lote seleccionado</Badge>}
        </div>

        <div className="h-[620px] w-full">
          <MapContainer center={center} zoom={5} scrollWheelZoom className="h-full w-full">
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler onSelectLot={onSelectLot} />
            {selectedLot ? (
              <>
                <Polygon positions={lotPolygon(selectedLot.lat, selectedLot.lng)} pathOptions={{ color: '#6B8E23', weight: 2, fillColor: ndviColor(selectedLot.ndvi), fillOpacity: 0.28 }}>
                  <Popup>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">{selectedLot.name}</p>
                      <p>Cultivo: {selectedLot.crop}</p>
                      <p>NDVI: {selectedLot.ndvi.toFixed(2)}</p>
                      <p>Área estimada: {selectedLot.areaHa} ha</p>
                    </div>
                  </Popup>
                </Polygon>
                <Polygon positions={lotPolygon(selectedLot.lat, selectedLot.lng)} pathOptions={{ color: '#FFFFFF', weight: 3, fillOpacity: 0 }} />
              </>
            ) : null}
          </MapContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/70 bg-white p-4 shadow-[0_10px_30px_rgba(78,54,45,0.08)]">
          <p className="text-sm font-semibold text-stone-900">NDVI overlay</p>
          <p className="mt-1 text-sm text-stone-500">El color del lote se recalcula al clickear en el mapa. El resultado alimenta el Orquestador AI.</p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {[
              ['0.15', '#D94B3D'],
              ['0.35', '#F29A36'],
              ['0.48', '#D8C94B'],
              ['0.62', '#91B63D'],
              ['0.78', '#4F7B1F'],
            ].map(([label, color]) => (
              <div key={label} className="overflow-hidden rounded-2xl border border-stone-200">
                <div className="h-8" style={{ background: color }} />
                <div className="bg-stone-50 px-2 py-2 text-center text-xs text-stone-600">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white p-4 shadow-[0_10px_30px_rgba(78,54,45,0.08)]">
          <p className="text-sm font-semibold text-stone-900">Acción rápida</p>
          <p className="mt-1 text-sm text-stone-500">Usá el lote seleccionado para disparar la recomendación técnica o financiera.</p>
          <Button className="mt-4 w-full" disabled={!selectedLot} onClick={onAnalyze}>Analizar lote</Button>
        </div>
      </div>
    </div>
  )
}
