import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Leaf, ShieldAlert, Sparkles, RotateCcw } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { diagnoseDtc } from "@/lib/agrocopilot.api";
import type { DtcResponse } from "@/lib/types";
import { useAsyncAction } from "@/hooks/useAsyncAction";

export const Route = createFileRoute("/asesor")({
  component: AsesorPage,
});

const fieldClassName =
  "w-full rounded-2xl border border-[rgba(91,69,52,0.12)] bg-white/82 px-4 py-3.5 text-[#4e362d] outline-none transition placeholder:text-[#9c8778] focus:border-[#bfa48f] focus:ring-2 focus:ring-[#e9d7c6]/70";

function AsesorPage() {
  const [code, setCode] = React.useState("000107.00");
  const [equipment, setEquipment] = React.useState("John Deere S780");
  const [symptom, setSymptom] = React.useState(
    "Filtro de aire tapado y pérdida de potencia",
  );
  const [context, setContext] = React.useState(
    "Cosecha de soja, polvo fino y alta temperatura",
  );

  const { data, loading, error, run, reset } = useAsyncAction(diagnoseDtc);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await run({
      code,
      equipment,
      symptom,
      context,
    });
  };

  const result = data as DtcResponse | null;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <PageHeader
        eyebrow="Asesor técnico / RAG"
        title="Diagnóstico de DTC"
        subtitle="Ingresá el código, el equipo y el contexto. El backend devuelve diagnóstico, causas probables, acciones inmediatas y criterio de stop."
        actions={
          <div className="paper-chip">
            <Sparkles className="h-4 w-4" />
            Motor técnico operativo
          </div>
        }
      />

      <section className="paper-card p-5 md:p-7">
        <div className="mb-5 flex items-start gap-3 rounded-[22px] border border-[rgba(91,69,52,0.08)] bg-[#fbf7f1] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e9d7c6] text-[#4e362d]">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#4e362d]">
              Modo lectura de taller
            </p>
            <p className="mt-1 text-sm leading-6 text-[#725d4f]">
              La pantalla prioriza la secuencia: falla, contexto, causas, acción
              inmediata y corrección. Nada de ruido visual.
            </p>
          </div>
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-[#6d5748]">Código DTC</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={fieldClassName}
              placeholder="000107.00"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[#6d5748]">Equipo</span>
            <input
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className={fieldClassName}
              placeholder="John Deere S780"
            />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-medium text-[#6d5748]">Síntoma</span>
            <input
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className={fieldClassName}
              placeholder="Pérdida de potencia, motor ahogado, etc."
            />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-medium text-[#6d5748]">Contexto</span>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className={`${fieldClassName} min-h-32 resize-y`}
              placeholder="Cosecha, polvo, temperatura, humedad, carga del motor..."
            />
          </label>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6f8b61] px-5 py-3.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              <ShieldAlert className="h-4 w-4" />
              {loading ? "Diagnóstico en curso..." : "Consultar DTC"}
            </button>

            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(91,69,52,0.12)] bg-white/75 px-5 py-3.5 text-sm font-medium text-[#4e362d] transition-transform hover:-translate-y-0.5"
            >
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </button>
          </div>
        </form>
      </section>

      {error ? (
        <section className="paper-card border border-[rgba(168,73,73,0.20)] bg-[#fff4f1] p-5 text-[#8f3e3e]">
          <div className="text-sm font-semibold uppercase tracking-[0.16em]">
            Error
          </div>
          <p className="mt-2 leading-7">{error}</p>
        </section>
      ) : null}

      {result ? (
        <section className="grid gap-5">
          <div className="paper-card p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="paper-kicker">Diagnóstico</span>
              <span className="paper-chip">Módulo: {result.module}</span>
              <span className="paper-chip">Severidad: {result.severity}</span>
              <span className="paper-chip">
                Confianza: {(result.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <h2 className="mt-4 font-display text-3xl italic text-[#4e362d] md:text-4xl">
              {result.diagnosis}
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#725d4f] md:text-base">
              {result.notes}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoList title="Causas probables" items={result.likely_causes} />
            <InfoList title="Acciones inmediatas" items={result.immediate_actions} />
            <InfoList title="Corrección definitiva" items={result.corrective_actions} />
            <InfoList title="Condiciones de stop" items={result.stop_conditions} />
          </div>

          <div className="paper-card p-5 md:p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6c57]">
              Fuentes
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {result.source_refs.map((source) => (
                <li
                  key={source}
                  className="paper-chip bg-white/90 text-[#6b5447]"
                >
                  {source}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function InfoList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="paper-card p-5">
      <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6c57]">
        {title}
      </div>
      <ul className="mt-3 space-y-2 text-sm leading-7 text-[#5d4a3e]">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-2xl border border-[rgba(91,69,52,0.08)] bg-[#fbf7f1] px-4 py-3"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}