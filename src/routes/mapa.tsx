// src/routes/mapa.tsx
import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { orchestrateNdvi } from "@/lib/agrocopilot.api";
import type { OrchestrationResponse } from "@/lib/types";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/mapa")({
  component: MapaPage,
});

function MapaPage() {
  const [fieldName, setFieldName] = React.useState("Lote El Ombú");
  const [ndviMean, setNdviMean] = React.useState("0.39");
  const [delta, setDelta] = React.useState("-0.07");
  const [variability, setVariability] = React.useState("0.61");
  const [soilHint, setSoilHint] = React.useState("Pergamino");
  const { data, loading, error, run, reset } = useAsyncAction(orchestrateNdvi);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await run({
      ndvi_report: {
        field_name: fieldName,
        ndvi_mean: Number(ndviMean),
        ndvi_delta_vs_history: Number(delta),
        biomass_variability: Number(variability),
        soil_hint: soilHint,
        crop: "maiz",
      },
      market_pressure: true,
      expected_margin_usd_ha: "85",
      crop_price_ars_ton: "430000",
      yield_qq_ha: "95",
      old_dex_pct: "26",
      new_dex_pct: "24",
      urea_price_usd_ton: "650",
      urea_shock_pct: "15",
      gasoil_price_usd_l: "1.05",
      gasoil_shock_pct: "34",
    });
  };

  const result = data as OrchestrationResponse | null;

  return (
    <main className="min-h-screen bg-[#090D0B] text-white p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Mapa / NDVI</h1>
          <p className="text-white/70">
            Cargá el reporte de biomasa y dejá que el orquestador decida si va a suelos, finanzas o ambos.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <Field label="Lote">
              <input value={fieldName} onChange={(e) => setFieldName(e.target.value)} className="input" />
            </Field>

            <Field label="NDVI medio">
              <input value={ndviMean} onChange={(e) => setNdviMean(e.target.value)} className="input" />
            </Field>

            <Field label="Delta vs histórico">
              <input value={delta} onChange={(e) => setDelta(e.target.value)} className="input" />
            </Field>

            <Field label="Variabilidad biomasa">
              <input value={variability} onChange={(e) => setVariability(e.target.value)} className="input" />
            </Field>

            <Field label="Serie sugerida">
              <select value={soilHint} onChange={(e) => setSoilHint(e.target.value)} className="input">
                <option value="Pergamino">Pergamino</option>
                <option value="Solís">Solís</option>
              </select>
            </Field>

            <div className="flex items-end gap-3">
              <button type="submit" disabled={loading} className="rounded-xl bg-lime-300 px-5 py-3 font-medium text-black">
                {loading ? "Corriendo grafo..." : "Orquestar"}
              </button>
              <button type="button" onClick={reset} className="rounded-xl border border-white/15 px-5 py-3 font-medium text-white/80">
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
              <p className="text-sm text-white/60">Ruta tomada</p>
              <h2 className="text-2xl font-semibold">{result.route_taken.toUpperCase()}</h2>
              <p className="mt-1 text-white/70">{result.recommendation}</p>
            </div>

            {result.soil ? (
              <Card title="Motor de suelos">
                <p className="text-white/90">
                  Serie recomendada: <strong>{result.soil.recommended_series}</strong> · Confianza{" "}
                  {formatNumber(result.soil.confidence * 100, 0)}%
                </p>
                <p className="mt-2 text-white/80">{result.soil.rationale}</p>
              </Card>
            ) : null}

            {result.finance ? (
              <Card title="Motor financiero">
                <p className="text-white/90">{result.finance.rationale}</p>
              </Card>
            ) : null}

            <Card title="Próximo paso">
              <p className="text-white/90">{result.next_step}</p>
            </Card>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm text-white/70">{label}</span>
      {children}
    </label>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-white/60">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

const inputClassName = "rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none";
Object.defineProperty(globalThis, "input", { value: inputClassName, writable: false });