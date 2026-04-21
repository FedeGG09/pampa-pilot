import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Newspaper, Calculator, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { macroNoticias } from "@/lib/mock-data";

export const Route = createFileRoute("/finanzas")({
  head: () => ({
    meta: [
      { title: "Finanzas & Macro · AgroCopilot AI" },
      {
        name: "description",
        content:
          "Calculadora de margen bruto dinámico, impacto de retenciones y noticias de la BCR Rosario.",
      },
    ],
  }),
  component: FinanzasPage,
});

function FinanzasPage() {
  // Sliders (USD or % units, simple model)
  const [precioSoja, setPrecioSoja] = useState(312); // USD/t
  const [rinde, setRinde] = useState(38); // qq/ha
  const [gasoil, setGasoil] = useState(1.05); // USD/L
  const [flete, setFlete] = useState(28); // USD/t
  const [fertilizante, setFertilizante] = useState(640); // USD/t
  const [retenciones, setRetenciones] = useState(33); // %

  // Simple gross margin model (USD/ha)
  const calc = useMemo(() => {
    const tonHa = rinde / 10; // qq → t
    const ingresoBruto = tonHa * precioSoja;
    const ingresoNeto = ingresoBruto * (1 - retenciones / 100);
    const costoFlete = tonHa * flete;
    const costoGasoil = gasoil * 80; // 80 L/ha aprox
    const costoFert = (fertilizante / 1000) * 180; // 180 kg/ha
    const otros = 110;
    const costoTotal = costoFlete + costoGasoil + costoFert + otros;
    const margen = ingresoNeto - costoTotal;
    return {
      ingresoBruto,
      ingresoNeto,
      costoTotal,
      margen,
      costoFlete,
      costoGasoil,
      costoFert,
      otros,
      retencionesUsd: ingresoBruto - ingresoNeto,
    };
  }, [precioSoja, rinde, gasoil, flete, fertilizante, retenciones]);

  return (
    <>
      <PageHeader
        eyebrow="Monitor financiero / macro"
        title="Margen Bruto Dinámico"
        subtitle="Soja 1ª · Zona núcleo · Campaña 2025/26 · estimación por hectárea"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        {/* Calculator */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <div className="text-sm font-semibold">Variables productivas</div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Slider
                label="Precio Soja (Pizarra Rosario)"
                unit="USD/t"
                min={200}
                max={420}
                step={1}
                value={precioSoja}
                onChange={setPrecioSoja}
              />
              <Slider
                label="Rinde esperado"
                unit="qq/ha"
                min={20}
                max={65}
                step={1}
                value={rinde}
                onChange={setRinde}
              />
              <Slider
                label="Gasoil"
                unit="USD/L"
                min={0.7}
                max={1.5}
                step={0.01}
                value={gasoil}
                onChange={setGasoil}
              />
              <Slider
                label="Flete corto"
                unit="USD/t"
                min={10}
                max={60}
                step={1}
                value={flete}
                onChange={setFlete}
              />
              <Slider
                label="Fertilizante (MAP)"
                unit="USD/t"
                min={400}
                max={950}
                step={10}
                value={fertilizante}
                onChange={setFertilizante}
              />
              <Slider
                label="Retenciones"
                unit="%"
                min={0}
                max={45}
                step={1}
                value={retenciones}
                onChange={setRetenciones}
                accent="warning"
              />
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-semibold">Estructura de costos · USD/ha</div>
            <div className="mt-4 space-y-2.5">
              <CostBar label="Flete" value={calc.costoFlete} max={calc.costoTotal + 50} />
              <CostBar label="Gasoil" value={calc.costoGasoil} max={calc.costoTotal + 50} />
              <CostBar label="Fertilización" value={calc.costoFert} max={calc.costoTotal + 50} />
              <CostBar label="Otros (semillas, fito)" value={calc.otros} max={calc.costoTotal + 50} />
            </div>
          </div>
        </div>

        {/* Result + macro */}
        <div className="space-y-4">
          <motion.div
            key={Math.round(calc.margen)}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            className={`rounded-2xl border p-6 ${
              calc.margen > 0
                ? "border-primary/40 bg-primary/10"
                : "border-destructive/40 bg-destructive/10"
            }`}
          >
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Margen bruto estimado
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <div
                className={`font-data text-5xl font-extrabold ${
                  calc.margen > 0 ? "neon-text" : "text-destructive"
                }`}
              >
                {calc.margen > 0 ? "+" : ""}
                {Math.round(calc.margen)}
              </div>
              <div className="font-mono text-sm text-muted-foreground">USD/ha</div>
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              {calc.margen > 0 ? (
                <TrendingUp className="h-3 w-3 text-primary" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              {calc.margen > 0 ? "Rentable" : "En zona crítica"}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <Metric label="Ingreso bruto" value={`$${Math.round(calc.ingresoBruto)}`} />
              <Metric label="Costo total" value={`$${Math.round(calc.costoTotal)}`} />
            </div>
          </motion.div>

          <div className="rounded-2xl border border-status-warning/40 bg-status-warning/5 p-5">
            <div className="flex items-center gap-2 text-status-warning">
              <AlertCircle className="h-4 w-4" />
              <div className="text-sm font-semibold">Impacto Retenciones</div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Con la alícuota actual del{" "}
              <span className="font-mono text-foreground">{retenciones}%</span> dejás de
              percibir
            </div>
            <div className="mt-1 font-data text-2xl font-bold text-status-warning">
              ${Math.round(calc.retencionesUsd)}
              <span className="ml-1 font-mono text-xs text-muted-foreground">USD/ha</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-primary" />
              <div className="text-sm font-semibold">Impacto Macro · BCR</div>
            </div>
            <ul className="space-y-3">
              {macroNoticias.map((n) => (
                <li
                  key={n.titulo}
                  className="rounded-xl border border-border bg-muted/30 p-3 transition hover:border-primary/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                      {n.tag}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {n.tiempo}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-semibold leading-snug">{n.titulo}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{n.resumen}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Fuente: {n.fuente}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

function Slider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  accent = "primary",
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  accent?: "primary" | "warning";
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const color = accent === "warning" ? "var(--status-warning)" : "var(--accent-lime)";
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-data text-sm font-semibold">
          {value} <span className="font-mono text-[10px] text-muted-foreground">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, ${color} ${pct}%, oklch(1 0 0 / 0.1) ${pct}%)`,
        }}
      />
    </div>
  );
}

function CostBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-data font-semibold">${Math.round(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted/40">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-data text-base font-semibold">{value}</div>
    </div>
  );
}
