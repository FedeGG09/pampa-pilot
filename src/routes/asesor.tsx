// src/routes/asesor.tsx
import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { diagnoseDtc } from "@/lib/agrocopilot.api";
import type { DtcResponse } from "@/lib/types";
import { useAsyncAction } from "@/hooks/useAsyncAction";

export const Route = createFileRoute("/asesor")({
  component: AsesorPage,
});

function AsesorPage() {
  const [code, setCode] = React.useState("000107.00");
  const [equipment, setEquipment] = React.useState("John Deere S780");
  const [symptom, setSymptom] = React.useState("Filtro de aire tapado y pérdida de potencia");
  const [context, setContext] = React.useState("Cosecha de soja, polvo fino y alta temperatura");
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
    <main className="min-h-screen bg-[#090D0B] text-white p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Asesor técnico</h1>
          <p className="text-white/70">
            Ingresá el DTC y el contexto operativo. El backend devuelve diagnóstico, causas probables y
            acciones correctivas.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <label className="grid gap-2">
              <span className="text-sm text-white/70">Código DTC</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder="000107.00"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-white/70">Equipo</span>
              <input
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
                placeholder="John Deere S780"
              />
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm text-white/70">Síntoma</span>
              <input
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              />
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm text-white/70">Contexto</span>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-28 rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              />
            </label>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-lime-300 px-5 py-3 font-medium text-black disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Diagnosticar..." : "Consultar DTC"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-white/15 px-5 py-3 font-medium text-white/80"
              >
                Limpiar
              </button>
            </div>
          </form>
        </section>

        {error ? (
          <section className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-red-100">
            {error}
          </section>
        ) : null}

        {result ? (
          <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div>
              <p className="text-sm text-white/60">Diagnóstico</p>
              <h2 className="text-2xl font-semibold">{result.diagnosis}</h2>
              <p className="mt-1 text-white/70">
                Módulo: {result.module} · Severidad: {result.severity} · Confianza: {(result.confidence * 100).toFixed(0)}%
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoList title="Causas probables" items={result.likely_causes} />
              <InfoList title="Acciones inmediatas" items={result.immediate_actions} />
              <InfoList title="Corrección definitiva" items={result.corrective_actions} />
              <InfoList title="Condiciones de stop" items={result.stop_conditions} />
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/60">Notas del asistente</p>
              <p className="mt-2 text-white/90">{result.notes}</p>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-white/60">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-white/90">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}