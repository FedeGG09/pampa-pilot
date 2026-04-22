import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, RotateCcw, Wallet } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { simulateFinance } from "@/lib/agrocopilot.api";
import type { FinancialSimulationResponse } from "@/lib/types";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { formatARS, formatUSD } from "@/lib/format";

export const Route = createFileRoute("/finanzas")({
  component: FinanzasPage,
});

const fieldClassName =
  "w-full rounded-2xl border border-[rgba(91,69,52,0.12)] bg-white/82 px-4 py-3.5 text-[#4e362d] outline-none transition placeholder:text-[#9c8778] focus:border-[#bfa48f] focus:ring-2 focus:ring-[#e9d7c6]/70";

function FinanzasPage() {
  const [crop, setCrop] = React.useState<
    "soja" | "maiz" | "trigo" | "girasol" | "sorgo"
  >("soja");
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

  const actionLabel = React.useMemo(() => {
    if (!result) return "";
    return result.recommended_action.replaceAll("_", " ");
  }, [result]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <PageHeader
        eyebrow="Finanzas / macro"
        title="Simulación financiera"
        subtitle="Calculá el impacto de la baja de retenciones frente al shock de urea y gasoil por hectárea. La interfaz prioriza la lectura rápida del margen."
        actions={
          <div className="paper-chip">
            <Wallet className="h-4 w-4" />
            Pizarra + costos
          </div>
        }
      />

      <section className="paper-card p-5 md:p-7">
        <div className="mb-5 rounded-[22px] border border-[rgba(91,69,52,0.08)] bg-[#fbf7f1] p-4">
          <p className="text-sm font-medium text-[#4e362d]">
            Lectura ejecutiva
          </p>
          <p className="mt-1 text-sm leading-6 text-[#725d4f]">
            El objetivo es mostrar de inmediato si la mejora fiscal compensa el
            aumento de costos y cuál es la acción sugerida: comprar, cubrir,
            mantener o postergar.
          </p>
        </div>

        <form className="grid gap-4 md:grid-cols-3" onSubmit={onSubmit}>
          <Field label="Cultivo">
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value as typeof crop)}
              className={fieldClassName}
            >
              <option value="soja">Soja</option>
              <option value="maiz">Maíz</option>
              <option value="trigo">Trigo</option>
              <option value="girasol">Girasol</option>
              <option value="sorgo">Sorgo</option>
            </select>
          </Field>

          <Field label="Precio pizarra ARS/t">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={fieldClassName}
            />
          </Field>

          <Field label="Rinde qq/ha">
            <input
              value={yieldQq}
              onChange={(e) => setYieldQq(e.target.value)}
              className={fieldClassName}
            />
          </Field>

          <Field label="DEX viejo %">
            <input
              value={oldDex}
              onChange={(e) => setOldDex(e.target.value)}
              className={fieldClassName}
            />
          </Field>

          <Field label="DEX nuevo %">
            <input
              value={newDex}
              onChange={(e) => setNewDex(e.target.value)}
              className={fieldClassName}
            />
          </Field>

          <Field label="Urea USD/t">
            <input
              value={ureaPrice}
              onChange={(e) => setUreaPrice(e.target.value)}
              className={fieldClassName}
            />
          </Field>

          <Field label="Shock urea %">
            <input
              value={ureaShock}
              onChange={(e) => setUreaShock(e.target.value)}
              className={fieldClassName}
            />
          </Field>

          <Field label="Gasoil USD/l">
            <input
              value={gasoilPrice}
              onChange={(e) => setGasoilPrice(e.target.value)}
              className={fieldClassName}
            />
          </Field>

          <Field label="Shock gasoil %">
            <input
              value={gasoilShock}
              onChange={(e) => setGasoilShock(e.target.value)}
              className={fieldClassName}
            />
          </Field>

          <div className="flex flex-wrap gap-3 md:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6f8b61] px-5 py-3.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowUpRight className="h-4 w-4" />
              {loading ? "Calculando..." : "Simular"}
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
        <section className="grid gap-4 md:grid-cols-2">
          <Metric
            title="Ingreso bruto"
            value={formatARS(result.breakdown.gross_revenue_ars_ha)}
          />
          <Metric
            title="Impacto neto"
            value={formatARS(result.breakdown.net_impact_ars_ha)}
          />
          <Metric
            title="Impacto USD/ha"
            value={formatUSD(result.breakdown.net_impact_usd_ha)}
          />
          <Metric title="Acción sugerida" value={actionLabel} />

          <div className="paper-card md:col-span-2 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="paper-kicker">Lectura ejecutiva</span>
              <span className="paper-chip">Riesgo: {result.risk_level}</span>
              <span className="paper-chip">FX: {result.fx_ars_usd} ARS/USD</span>
            </div>

            <p className="mt-4 max-w-4xl text-sm leading-7 text-[#725d4f] md:text-base">
              {result.rationale}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {result.assumptions.map((a) => (
                <span key={a} className="paper-chip bg-white/90 text-[#6b5447]">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[#6d5748]">{label}</span>
      {children}
    </label>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="paper-card p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b6c57]">
        {title}
      </p>
      <p className="mt-3 font-display text-3xl italic text-[#4e362d] md:text-4xl">
        {value}
      </p>
    </div>
  );
}