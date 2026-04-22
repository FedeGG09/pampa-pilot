import { useState } from 'react'
import { useAppContext } from '@/context/app-context'
import { useDtcDiagnosis } from '@/hooks/useDtcDiagnosis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/form-controls'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { formatPercent } from '@/lib/utils'
import { TriangleAlert, CheckCircle2, Gauge } from 'lucide-react'

export function DtcPage() {
  const { dispatch } = useAppContext()
  const { data, loading, error, run } = useDtcDiagnosis()

  const [code, setCode] = useState('000107.00')
  const [equipment, setEquipment] = useState('John Deere S780')
  const [symptom, setSymptom] = useState('Pérdida de rendimiento y aumento de temperatura en cosecha.')
  const [context, setContext] = useState('Lote con trigo en madurez, humedad variable y vibración intermitente.')

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle>Asesor técnico (DTC)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código DTC" />
            <Input value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="Equipo" />
            <Textarea value={symptom} onChange={(e) => setSymptom(e.target.value)} placeholder="Síntoma" />
            <Textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Contexto" />
          </div>

          {error ? <Alert tone="danger">{error}</Alert> : null}

          <Button className="w-full" disabled={loading} onClick={async () => {
            const result = await run({ code, equipment, symptom, context })
            dispatch({ type: 'push_log', payload: { level: result.severity === 'critical' || result.severity === 'high' ? 'warn' : 'info', title: 'Diagnóstico técnico emitido', detail: `${result.module} · confianza ${(result.confidence * 100).toFixed(0)}%` } })
          }}>{loading ? 'Analizando...' : 'Diagnosticar'}</Button>

          {data ? (
            <div className="space-y-3 rounded-3xl border border-stone-100 bg-stone-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{data.diagnosis}</p>
                <Badge variant={data.severity === 'critical' || data.severity === 'high' ? 'danger' : data.severity === 'medium' ? 'warning' : 'success'}>{data.severity}</Badge>
              </div>
              <p className="text-sm text-stone-600">Módulo: {data.module}</p>
              <p className="text-sm text-stone-600">Confianza: {formatPercent(data.confidence, 0)}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informe técnico estructurado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data ? <Alert tone="info">El resultado se mostrará con formato tipo manual técnico.</Alert> : (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-stone-50 p-4"><Gauge className="h-5 w-5 text-[var(--primary)]" /><p className="mt-2 text-sm text-stone-500">Diagnóstico</p><p className="font-semibold">{data.diagnosis}</p></div>
                <div className="rounded-2xl bg-stone-50 p-4"><TriangleAlert className="h-5 w-5 text-amber-600" /><p className="mt-2 text-sm text-stone-500">Severidad</p><p className="font-semibold">{data.severity}</p></div>
                <div className="rounded-2xl bg-stone-50 p-4"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><p className="mt-2 text-sm text-stone-500">Confianza</p><p className="font-semibold">{formatPercent(data.confidence, 0)}</p></div>
              </div>

              <SectionTitle title="Causas probables" items={data.likely_causes} />
              <SectionTitle title="Acciones inmediatas" items={data.immediate_actions} />
              <SectionTitle title="Acciones correctivas" items={data.corrective_actions} />
              <SectionTitle title="Condiciones de parada" items={data.stop_conditions} />

              {data.notes ? <Alert tone="info"><p className="text-sm">{data.notes}</p></Alert> : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SectionTitle({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-3xl border border-stone-100 bg-white p-4">
      <p className="font-semibold">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-stone-600">
        {items.length === 0 ? <li className="text-stone-400">Sin información devuelta por la API.</li> : null}
        {items.map((item) => <li key={item} className="rounded-2xl bg-stone-50 px-3 py-2">{item}</li>)}
      </ul>
    </section>
  )
}
