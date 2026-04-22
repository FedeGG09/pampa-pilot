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
  "w-full rounded-xl border border-[#d6c6b8] bg-white px-4 py-3 text-[#4e362d] outline-none transition focus:border-[#6B8E23] focus:ring-2 focus:ring-[#6B8E23]/30";

function AsesorPage() {
  const [code, setCode] = React.useState("000107.00");
  const [equipment, setEquipment] = React.useState("John Deere S780");
  const [symptom, setSymptom] = React.useState(
    "Filtro de aire tapado y pérdida de potencia"
  );
  const [context, setContext] = React.useState(
    "Cosecha de soja, polvo fino y alta temperatura"
  );

  const { data, loading, error, run, reset } = useAsyncAction(diagnoseDtc);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await run({ code, equipment, symptom, context });
  };

  const result = data as DtcResponse | null;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <PageHeader
        eyebrow="Asesor técnico · RAG"
        title="Diagnóstico de maquinaria"
        subtitle="Sistema experto para diagnóstico de fallas basado en manuales técnicos y contexto operativo."
        actions={
          <div className="flex items-center gap-2 rounded-full bg-[#e9f0e3] px-3 py-1 text-xs text-[#4e362d]">
            <Sparkles className="h-4 w-4 text-[#6B8E23]" />
            Motor activo
          </div>
        }
      />

      {/* FORM */}
      <section className="rounded-2xl border border-[#e6ddd4] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f0e3]">
            <Leaf className="h-5 w-5 text-[#6B8E23]" />
          </div>
          <div>
            <p className="font-medium text-[#4e362d]">
              Modo diagnóstico técnico
            </p>
            <p className="text-sm text-[#7b6a5f]">
              Ingresá datos reales de campo para obtener un diagnóstico preciso.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <Input label="Código DTC">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={fieldClassName}
              placeholder="000107.00"
            />
          </Input>

          <Input label="Equipo">
            <input
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className={fieldClassName}
              placeholder="John Deere S780"
            />
          </Input>

          <Input label="Síntoma" full>
            <input
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className={fieldClassName}
              placeholder="Pérdida de potencia, vibración, etc."
            />
          </Input>

          <Input label="Contexto" full>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className={`${fieldClassName} min-h-28 resize-y`}
              placeholder="Condiciones de operación..."
            />
          </Input>

          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#6B8E23] px-5 py-3 text-white transition hover:opacity-90 disabled:opacity-60"
            >
              <ShieldAlert className="h-4 w-4" />
              {loading ? "Analizando..." : "Diagnosticar"}
            </button>

            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-2 rounded-xl border border-[#d6c6b8] px-5 py-3 text-[#4e362d]"
            >
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </button>
          </div>
        </form>
      </section>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* RESULT */}
      {result && (
        <section className="space-y-4">
          {/* HEADER RESULT */}
          <div className="rounded-2xl border border-[#e6ddd4] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-2 text-xs text-[#7b6a5f]">
              <Badge>{result.module}</Badge>
              <Badge>{result.severity}</Badge>
              <Badge>
                {(result.confidence * 100).toFixed(0)}% confianza
              </Badge>
            </div>

            <h2 className="mt-3 text-2xl font-semibold text-[#4e362d]">
              {result.diagnosis}
            </h2>

            <p className="mt-2 text-sm text-[#6f5c50]">{result.notes}</p>
          </div>

          {/* GRID */}
          <div className="grid gap-4 md:grid-cols-2">
            <InfoList title="Causas probables" items={result.likely_causes} />
            <InfoList title="Acción inmediata" items={result.immediate_actions} />
            <InfoList title="Corrección" items={result.corrective_actions} />
            <InfoList title="Condiciones de stop" items={result.stop_conditions} />
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------------- COMPONENTES ---------------- */

function Input({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`grid gap-2 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-sm font-medium text-[#6d5748]">{label}</span>
      {children}
    </label>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#f0ede9] px-3 py-1">
      {children}
    </span>
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
    <div className="rounded-2xl border border-[#e6ddd4] bg-white p-5">
      <p className="text-sm font-semibold text-[#6d5748]">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-[#4e362d]">
        {items.map((item) => (
          <li key={item} className="rounded-lg bg-[#f8f5f2] p-3">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}