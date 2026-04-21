// src/routes/finanzas.tsx
import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { simulateFinance } from "@/lib/agrocopilot.api";
import type { FinancialSimulationResponse } from "@/lib/types";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { formatARS, formatUSD } from "@/lib/format";

export const Route = createFileRoute("/finanzas")({
  component: FinanzasPage,
});

function FinanzasPage() {
  const [crop, setCrop] = React.useState<"soja" | "maiz" | "trigo" | "girasol" | "sorgo">("soja");
  const [price, setPrice] = React.useState("430000");
  const [yieldQq, setYieldQq] = React.useState("38");
  const [oldDex, setOldDex] = React.useState("26");
  const [newDex, setNewDex] = React.useState("24");
  const [ureaPrice, setUreaPrice] = React.useState("650");
  const [ureaShock, setUreaShock] = React.useState("15");
  const [gasoilPrice, setGasoilPrice] = React.useState("1.05");
  const [gasoilShock, setGasoilShock] = React.useState("34");
  const { data, loading, error, run, reset } = useAsyncAction(simulateFinance);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await run({
      crop,
      price_ars_ton: price,
      yield_qq_ha: yieldQq,
      old_dex_pct: oldDex,
      new_dex_pct: newDex,
      fx_ars_usd: "1368",
      urea_price_usd_ton: ureaPrice,
      urea_shock_pct: ureaShock,
      urea_applied_kg_ha: "180",
      gasoil_price_usd_l: gasoilPrice,
      gasoil_shock_pct: gasoilShock,
      gasoil_use_l_ha: "80",
      other_costs_ars_ha: "0",
    });
  };

  const result = data as FinancialSimulationResponse | null;

  return (
    <main className="min-h-screen bg-[#090D0B] text-white p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Simulación financiera</h1>
          <p className="text-white/70">
            Calculá el impacto de DEX y del shock de urea/gasoil con un esquema por hectárea.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <form className="grid gap-4 md:grid-cols-3" onSubmit={onSubmit}>
            <Field label="Cultivo">
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value as typeof crop)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
              >
                <option value="soja">Soja</option>
                <option value="maiz">Maíz</option>
                <option value="trigo">Trigo</option>
                <option value="girasol">Girasol</option>
                <option value="sorgo">Sorgo</option>
              </select>
            </Field>

            <Field label="Precio pizarra ARS/t">
              <input value={price} onChange={(e) => setPrice(e.target.value)} className="input" />
            </Field>

            <Field label="Rinde qq/ha">
              <input value={yieldQq} onChange={(e) => setYieldQq(e.target.value)} className="input" />
            </Field>

            <Field label="DEX viejo %">
              <input value={oldDex} onChange={(e) => setOldDex(e.target.value)} className="input" />
            </Field>

            <Field label="DEX nuevo %">
              <input value={newDex} onChange={(e) => setNewDex(e.target.value)} className="input" />
            </Field>

            <Field label="Urea USD/t">
              <input value={ureaPrice} onChange={(e) => setUreaPrice(e.target.value)} className="input" />
            </Field>

            <Field label="Shock urea %">
              <input value={ureaShock} onChange={(e) => setUreaShock(e.target.value)} className="input" />
            </Field>

            <Field label="Gasoil USD/l">
              <input value={gasoilPrice} onChange={(e) => setGasoilPrice(e.target.value)} className="input" />
            </Field>

            <Field label="Shock gasoil %">
              <input value={gasoilShock} onChange={(e) => setGasoilShock(e.target.value)} className="input" />
            </Field>

            <div className="flex gap-3 md:col-span-3">
              <button type="submit" disabled={loading} className="rounded-xl bg-lime-300 px-5 py-3 font-medium text-black">
                {loading ? "Calculando..." : "Simular"}
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
          <section className="grid gap-4 md:grid-cols-2">
            <Metric title="Ingreso bruto" value={formatARS(result.breakdown.gross_revenue_ars_ha)} />
            <Metric title="Impacto neto" value={formatARS(result.breakdown.net_impact_ars_ha)} />
            <Metric title="Impacto USD/ha" value={formatUSD(result.breakdown.net_impact_usd_ha)} />
            <Metric title="Acción sugerida" value={result.recommended_action.replaceAll("_", " ")} />

            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/60">Lectura ejecutiva</p>
              <p className="mt-2 text-white/90">{result.rationale}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{result.risk_level}</Badge>
                {result.assumptions.map((a) => (
                  <Badge key={a}>{a}</Badge>
                ))}
              </div>
            </div>
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

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="text-sm text-white/60">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80">{children}</span>;
}

const inputClassName =
  "rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none";
Object.defineProperty(globalThis, "input", { value: inputClassName, writable: false });