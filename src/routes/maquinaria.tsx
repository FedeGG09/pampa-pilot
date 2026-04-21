// src/routes/maquinaria.tsx
import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { diagnoseDtc } from "@/lib/agrocopilot.api";
import type { DtcResponse } from "@/lib/types";
import { useAsyncAction } from "@/hooks/useAsyncAction";

export const Route = createFileRoute("/maquinaria")({
  component: MaquinariaPage,
});

function MaquinariaPage() {
  const [code, setCode] = React.useState("000107.00");
  const { data, loading, error, run } = useAsyncAction(diagnoseDtc);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await run({
      code,
      equipment: "John Deere",
      symptom: "Pérdida de potencia",
      context: "Control operativo durante cosecha",
    });
  };

  const result = data as DtcResponse | null;

  return (
    <main className="min-h-screen bg-[#090D0B] text-white p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-semibold">Maquinaria</h1>

        <form onSubmit={submit} className="flex gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
          />
          <button className="rounded-xl bg-lime-300 px-5 py-3 font-medium text-black" disabled={loading}>
            Diagnosticar
          </button>
        </form>

        {error ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5">{error}</div> : null}

        {result ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-2xl font-semibold">{result.diagnosis}</h2>
            <p className="mt-1 text-white/70">
              {result.module} · {result.severity}
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}