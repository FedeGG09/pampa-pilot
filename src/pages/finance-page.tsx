import { useMemo, useState } from 'react'
import { useAppContext } from '@/context/app-context'
import { useFinanceSimulation } from '@/hooks/useFinanceSimulation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/form-controls'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyARS, formatCurrencyUSD, formatNumber } from '@/lib/utils'

const defaultFx = 1368

export function FinancePage() {
  const { dispatch } = useAppContext()
  const { data, loading, error, run } = useFinanceSimulation()

  const [areaHa, setAreaHa] = useState(180)
  const [yieldKgHa, setYieldKgHa] = useState(4200)
  const [priceUsdTon, setPriceUsdTon] = useState(390)
  const [dexRatePct, setDexRatePct] = useState(0)
  const [ureaKgHa, setUreaKgHa] = useState(90)
  const [ureaPriceUsdTon, setUreaPriceUsdTon] = useState(490)
  const [gasoilLHa, setGasoilLHa] = useState(32)
  const [gasoilPriceArsL, setGasoilPriceArsL] = useState(1175)

  const fx = defaultFx

  const simpleEstimate = useMemo(() => {
    const revenueUsd = areaHa * (yieldKgHa / 1000) * priceUsdTon
    const revenueArs = revenueUsd * fx
    const ureaUsd = areaHa * (ureaKgHa / 1000) * ureaPriceUsdTon
    const gasoilArs = areaHa * gasoilLHa * gasoilPriceArsL
    const costArs = ureaUsd * fx + gasoilArs
    return { revenueUsd, revenueArs, costArs, marginArs: revenueArs - costArs }
  }, [areaHa, yieldKgHa, priceUsdTon, ureaKgHa, ureaPriceUsdTon, gasoilLHa, gasoilPriceArsL, fx])

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader><CardTitle>Simulador financiero</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input type="number" value={areaHa} onChange={(e) => setAreaHa(Number(e.target.value))} placeholder="Área ha" />
            <Input type="number" value={yieldKgHa} onChange={(e) => setYieldKgHa(Number(e.target.value))} placeholder="Rinde kg/ha" />
            <Input type="number" value={priceUsdTon} onChange={(e) => setPriceUsdTon(Number(e.target.value))} placeholder="Precio USD/tn" />
            <Input type="number" value={dexRatePct} onChange={(e) => setDexRatePct(Number(e.target.value))} placeholder="DEX %" />
            <Input type="number" value={ureaKgHa} onChange={(e) => setUreaKgHa(Number(e.target.value))} placeholder="Urea kg/ha" />
            <Input type="number" value={ureaPriceUsdTon} onChange={(e) => setUreaPriceUsdTon(Number(e.target.value))} placeholder="Urea USD/tn" />
            <Input type="number" value={gasoilLHa} onChange={(e) => setGasoilLHa(Number(e.target.value))} placeholder="Gasoil l/ha" />
            <Input type="number" value={gasoilPriceArsL} onChange={(e) => setGasoilPriceArsL(Number(e.target.value))} placeholder="Gasoil ARS/l" />
          </div>

          <div className="rounded-3xl bg-stone-50 p-4 text-sm text-stone-600">Referencia de tipo de cambio: <span className="font-semibold text-stone-900">{formatNumber(fx)} ARS/USD</span></div>

          {error ? <Alert tone="danger">{error}</Alert> : null}

          <Button className="w-full" disabled={loading} onClick={async () => {
            const result = await run({ area_ha: areaHa, yield_kg_ha: yieldKgHa, price_usd_ton: priceUsdTon, dex_rate_pct: dexRatePct, urea_kg_ha: ureaKgHa, urea_price_usd_ton: ureaPriceUsdTon, gasoil_l_ha: gasoilLHa, gasoil_price_ars_l: gasoilPriceArsL, exchange_rate_ars_usd: fx })
            dispatch({ type: 'push_log', payload: { level: 'info', title: 'Simulación financiera ejecutada', detail: `Margen ARS ${formatCurrencyARS(result.margin_ars)}` } })
          }}>{loading ? 'Simulando...' : 'Calcular impacto'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado económico</CardTitle>
          {data ? <Badge variant={data.margin_ars >= 0 ? 'success' : 'danger'}>Simulación API</Badge> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {data ? (
            <ResultBlock revenueArs={data.revenue_ars} revenueUsd={data.revenue_usd} costArs={data.cost_ars} marginArs={data.margin_ars} marginUsd={data.margin_usd} recommendation={data.recommendation} />
          ) : (
            <ResultBlock revenueArs={simpleEstimate.revenueArs} revenueUsd={simpleEstimate.revenueUsd} costArs={simpleEstimate.costArs} marginArs={simpleEstimate.marginArs} marginUsd={simpleEstimate.marginArs / fx} recommendation="Ajustar insumos, recalibrar margen y comparar con el Orquestador AI." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ResultBlock({ revenueArs, revenueUsd, costArs, marginArs, marginUsd, recommendation }: { revenueArs: number; revenueUsd: number; costArs: number; marginArs: number; marginUsd: number; recommendation: string }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <StatCard label="Ingresos ARS" value={formatCurrencyARS(revenueArs)} />
        <StatCard label="Ingresos USD" value={formatCurrencyUSD(revenueUsd)} />
        <StatCard label="Costos ARS" value={formatCurrencyARS(costArs)} />
        <StatCard label="Margen ARS" value={formatCurrencyARS(marginArs)} tone={marginArs >= 0 ? 'good' : 'danger'} />
      </div>

      <div className="rounded-3xl border border-stone-100 bg-stone-50 p-4">
        <p className="text-sm font-semibold text-stone-900">Recomendación</p>
        <p className="mt-1 text-sm text-stone-600">{recommendation}</p>
        <p className="mt-2 text-sm text-stone-600">Margen USD estimado: {formatCurrencyUSD(marginUsd)}</p>
      </div>
    </div>
  )
}

function StatCard({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'good' | 'danger' }) {
  return (
    <div className="rounded-3xl bg-stone-50 p-4">
      <p className="text-sm text-stone-500">{label}</p>
      <p className={tone === 'danger' ? 'mt-2 text-2xl font-semibold text-red-600' : tone === 'good' ? 'mt-2 text-2xl font-semibold text-[var(--primary)]' : 'mt-2 text-2xl font-semibold'}>{value}</p>
    </div>
  )
}
