import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Cloud,
  Droplets,
  Wind,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { kpis, margenChart, pizarraRosario, clima } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · AgroCopilot AI" },
      {
        name: "description",
        content:
          "Centro de control con KPIs de rinde, margen bruto, pizarra Rosario y alertas de maquinaria.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Campaña 2025/26"
        title="Buen día, Mariano 🌱"
        subtitle="Resumen operativo de tu estancia · Pergamino, Bs. As."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            <Sparkles className="h-4 w-4" />
            Generar reporte IA
          </button>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-hover rounded-2xl border border-border bg-card p-4 md:p-5"
          >
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {k.label}
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <div className="font-data text-3xl font-bold tracking-tight md:text-4xl">
                {k.value}
              </div>
              <div className="font-mono text-xs text-muted-foreground">{k.unit}</div>
            </div>
            <div
              className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
                k.positive ? "text-primary" : "text-destructive"
              }`}
            >
              {k.positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {k.delta}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Main Chart */}
        <div className="card-hover rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Margen Bruto Dinámico · USD/ha</div>
              <div className="text-xs text-muted-foreground">
                Proyección de campaña vs. realizado
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary" /> Realizado
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-[var(--accent-green)]" />{" "}
                Proyección
              </span>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={margenChart}>
                <defs>
                  <linearGradient id="gMargen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-lime)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--accent-lime)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gProy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-green)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--accent-green)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis
                  dataKey="mes"
                  stroke="oklch(0.7 0.02 155)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="oklch(0.7 0.02 155)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.19 0.018 250)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="proyeccion"
                  stroke="var(--accent-green)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="url(#gProy)"
                />
                <Area
                  type="monotone"
                  dataKey="margen"
                  stroke="var(--accent-lime)"
                  strokeWidth={2.5}
                  fill="url(#gMargen)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clima */}
        <div className="card-hover rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Clima local</div>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">{clima.ubicacion}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="font-data text-5xl font-bold">{clima.temp}°</div>
            <div className="text-sm text-muted-foreground">{clima.condicion}</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/40 p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Droplets className="h-3 w-3" /> Humedad
              </div>
              <div className="mt-1 font-data text-xl font-semibold">{clima.humedad}%</div>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Wind className="h-3 w-3" /> Viento
              </div>
              <div className="mt-1 font-data text-xl font-semibold">
                {clima.viento}
                <span className="text-xs text-muted-foreground"> km/h</span>
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-primary/30 bg-primary/10 p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-primary">
              Pronóstico estacional
            </div>
            <div className="mt-1 text-xs">{clima.pronostico}</div>
          </div>
        </div>
      </div>

      {/* Pizarra + alerta */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card-hover rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold">Pizarra Rosario · BCR</div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Actualizado 11:32
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {pizarraRosario.map((p) => (
              <div
                key={p.producto}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <div className="text-xs font-medium text-muted-foreground">
                  {p.producto}
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <div className="font-data text-2xl font-bold">{p.precio}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {p.unidad}
                  </div>
                </div>
                <div
                  className={`mt-1 text-xs font-medium ${
                    p.positive ? "text-primary" : "text-destructive"
                  }`}
                >
                  {p.delta}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-status-warning/40 bg-status-warning/5 p-5">
          <div className="flex items-center gap-2 text-status-warning">
            <AlertTriangle className="h-4 w-4" />
            <div className="text-sm font-semibold">Alerta de maquinaria</div>
          </div>
          <div className="mt-3 text-sm">
            <span className="font-semibold">Cosechadora John Deere S780</span>
            <div className="mt-1 text-xs text-muted-foreground">
              Presión hidráulica baja · Lote El Ombú
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/50">
              <div className="h-full w-[42%] bg-status-warning" />
            </div>
            <span className="font-mono text-xs">42%</span>
          </div>
          <button className="mt-4 w-full rounded-xl border border-status-warning/40 bg-status-warning/10 py-2 text-xs font-semibold text-status-warning transition hover:bg-status-warning/20">
            Ver diagnóstico →
          </button>
        </div>
      </div>
    </>
  );
}
