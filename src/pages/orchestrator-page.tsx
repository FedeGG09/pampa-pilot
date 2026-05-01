import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Sparkles, MessageCircle, ArrowRight, Bot } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { useOrchestratorAnalysis } from '@/hooks/useOrchestratorAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { formatPercent, ndviLabel } from '@/lib/utils';
import agronomistImg from '@/assets/agronomist.jpeg';
import financeImg from '@/assets/finance.png';
import machineryImg from '@/assets/machinery.png';
import peopleLegalImg from '@/assets/people_legal.png';
import type { AgentId, OpenChatEventDetail } from '@/types/chat';

const AGENTS: Array<{
  id: AgentId;
  name: string;
  description: string;
  image: string;
  accent: string;
}> = [
  {
    id: 'agronomist',
    name: 'Agrónomo',
    description: 'Manejo, cultivos, sanidad, suelo y decisiones técnicas.',
    image: agronomistImg,
    accent: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  },
  {
    id: 'finance',
    name: 'Finanzas',
    description: 'Costos, margen, simulaciones y escenarios económicos.',
    image: financeImg,
    accent: 'bg-sky-50 text-sky-800 ring-sky-200',
  },
  {
    id: 'machinery',
    name: 'Maquinaria',
    description: 'Capacidad operativa, mantenimiento y eficiencia.',
    image: machineryImg,
    accent: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  {
    id: 'people_legal',
    name: 'Gente y Legal',
    description: 'Contratos, RR.HH., cumplimiento y documentación.',
    image: peopleLegalImg,
    accent: 'bg-violet-50 text-violet-800 ring-violet-200',
  },
];

function openFloatingChat(detail?: OpenChatEventDetail) {
  if (typeof window === 'undefined') return;

  if (!detail) {
    window.dispatchEvent(new Event('agrocopilot:open-chat'));
    return;
  }

  window.dispatchEvent(
    new CustomEvent<OpenChatEventDetail>('agrocopilot:open-chat', {
      detail,
    }),
  );
}

export function OrchestratorPage() {
  const { state, dispatch } = useAppContext();
  const { data, loading, error, run } = useOrchestratorAnalysis();
  const navigate = useNavigate();

  const lot = state.selectedLot;

  const payload = useMemo(
    () =>
      lot
        ? {
            ndvi: lot.ndvi,
            location: { lat: lot.lat, lng: lot.lng, label: lot.name },
            crop: lot.crop,
            lot_name: lot.name,
          }
        : null,
    [lot],
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-stone-200 bg-white/80 shadow-sm backdrop-blur">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-2xl">Orquestador AI</CardTitle>
              <Badge variant="info" className="gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Multiagente
              </Badge>
            </div>
            <p className="text-sm text-stone-500">
              El análisis central sigue aquí, pero la conversación operativa vive en
              el chat flotante multiagente.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {lot ? (
              <div className="rounded-3xl border border-stone-100 bg-stone-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Bot className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Lote seleccionado</p>
                    <p className="mt-0.5 text-lg font-semibold text-stone-900">
                      {lot.name}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-stone-600">
                  {lot.crop.toUpperCase()} · NDVI {lot.ndvi.toFixed(2)} ·{' '}
                  {ndviLabel(lot.ndvi)}
                </p>
              </div>
            ) : (
              <Alert tone="info">Primero seleccioná un lote en el mapa.</Alert>
            )}

            {error ? <Alert tone="danger">{error}</Alert> : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                disabled={!payload || loading}
                onClick={async () => {
                  if (!payload) return;
                  const result = await run(payload);
                  dispatch({
                    type: 'push_log',
                    payload: {
                      level: 'info',
                      title: 'Orquestador analizó el lote',
                      detail: `${result.decision} · confianza ${formatPercent(result.confidence, 0)}`,
                    },
                  });
                }}
              >
                {loading ? 'Analizando...' : 'Ejecutar orquestación'}
              </Button>

              <Button variant="secondary" onClick={() => navigate({ to: '/mapa' })}>
                Volver al mapa
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white/80 shadow-sm backdrop-blur">
          <CardHeader className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">Recomendación final</CardTitle>
              <p className="mt-1 text-sm text-stone-500">
                La decisión final aparece luego del análisis.
              </p>
            </div>
            {data ? (
              <Badge variant={data.decision === 'financial' ? 'warning' : 'success'}>
                {data.decision}
              </Badge>
            ) : null}
          </CardHeader>

          <CardContent>
            {!data ? (
              <Alert tone="info">
                La decisión final aparecerá aquí después del análisis.
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="rounded-3xl bg-stone-50 p-4">
                  <p className="text-sm text-stone-500">Resumen</p>
                  <p className="mt-1 font-medium text-stone-900">{data.summary}</p>
                </div>

                <div className="rounded-3xl bg-stone-50 p-4">
                  <p className="text-sm text-stone-500">Motivo</p>
                  <p className="mt-1 text-sm text-stone-600">{data.reason}</p>
                </div>

                <div className="rounded-3xl bg-stone-50 p-4">
                  <p className="text-sm text-stone-500">Próximos pasos</p>
                  <ul className="mt-3 space-y-2 text-sm text-stone-600">
                    {data.next_actions.map((item) => (
                      <li key={item} className="rounded-2xl bg-white px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Stat label="Confianza" value={formatPercent(data.confidence, 0)} />
                  <Stat
                    label="Flujo sugerido"
                    value={data.suggested_flow.toUpperCase()}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl">Agentes disponibles en el chat flotante</CardTitle>
            <Button
              variant="secondary"
              className="shrink-0"
              onClick={() => openFloatingChat({ agentId: 'agronomist' })}
            >
              <MessageCircle className="h-4 w-4" />
              Abrir chat
            </Button>
          </div>
          <p className="text-sm text-stone-500">
            Tocá cualquier especialista para abrir el chat flotante ya enfocado en ese agente.
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => openFloatingChat({ agentId: agent.id })}
                className="group rounded-[28px] border border-stone-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-md"
              >
                <div className="relative overflow-hidden rounded-3xl">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  <div
                    className={`absolute left-3 top-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${agent.accent}`}
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    Especialista
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-stone-900">{agent.name}</h3>
                    <ArrowRight className="h-4 w-4 text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
                  </div>
                  <p className="text-sm leading-5 text-stone-600">
                    {agent.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-stone-50 p-4">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-stone-900">{value}</p>
    </div>
  );
}