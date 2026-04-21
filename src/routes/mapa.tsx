import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Layers, Sparkles, Droplets, Leaf, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { lotes, type Lote } from "@/lib/mock-data";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa de Lotes · AgroCopilot AI" },
      {
        name: "description",
        content:
          "Mapa interactivo de lotes con capas de rinde, NDVI y humedad. Análisis de suelo y recomendación de IA por lote.",
      },
    ],
  }),
  component: MapaPage,
});

type Capa = "rinde" | "ndvi" | "humedad";

const capas: { id: Capa; label: string; icon: typeof Layers }[] = [
  { id: "rinde", label: "Mapa de Rinde", icon: BarChart3 },
  { id: "ndvi", label: "Índice Verde (NDVI)", icon: Leaf },
  { id: "humedad", label: "Humedad", icon: Droplets },
];

function MapaPage() {
  const [selected, setSelected] = useState<Lote | null>(null);
  const [capa, setCapa] = useState<Capa>("ndvi");

  const opacityFor = (lote: Lote) => {
    if (capa === "rinde") return Math.min(1, lote.rinde / 90);
    if (capa === "ndvi") return lote.ndvi;
    return lote.humedad / 100;
  };

  return (
    <>
      <PageHeader
        eyebrow="Geolocalización satelital"
        title="Mapa de Lotes"
        subtitle="5 lotes activos · 770 ha totales · última pasada satelital hace 2 días"
      />

      {/* Capas toggle */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <Layers className="mr-1 inline h-3 w-3" /> Capa activa:
        </span>
        {capas.map((c) => {
          const Icon = c.icon;
          const active = c.id === capa;
          return (
            <button
              key={c.id}
              onClick={() => setCapa(c.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="relative grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Map */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
          <div
            className="relative h-[420px] md:h-[560px]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 30%, oklch(0.28 0.06 150 / 0.6), transparent 60%), radial-gradient(circle at 70% 70%, oklch(0.22 0.04 158 / 0.8), transparent 60%), linear-gradient(180deg, #0a1410 0%, #050a08 100%)",
            }}
          >
            {/* Grid overlay */}
            <div className="absolute inset-0 grid-bg opacity-50" />

            {/* SVG lots */}
            <svg
              viewBox="0 0 800 520"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {lotes.map((lote) => {
                const isSel = selected?.id === lote.id;
                return (
                  <g
                    key={lote.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(lote)}
                  >
                    <polygon
                      points={lote.points}
                      fill={lote.color}
                      fillOpacity={opacityFor(lote) * 0.45}
                      stroke={lote.color}
                      strokeWidth={isSel ? 3 : 1.5}
                      style={{
                        filter: isSel
                          ? "drop-shadow(0 0 12px var(--accent-lime))"
                          : "drop-shadow(0 0 4px rgba(0,0,0,0.6))",
                        transition: "all 0.2s ease",
                      }}
                    />
                    {/* Centroid label */}
                    <LoteLabel points={lote.points} nombre={lote.nombre} ha={lote.hectareas} />
                  </g>
                );
              })}
            </svg>

            {/* Compass / scale */}
            <div className="absolute bottom-4 right-4 rounded-xl border border-border bg-background/70 px-3 py-2 backdrop-blur-md">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Escala 1:25.000
              </div>
            </div>
            <div className="absolute left-4 top-4 rounded-xl border border-border bg-background/70 px-3 py-2 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span className="font-mono uppercase tracking-wider text-muted-foreground">
                  Live · Sentinel-2
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lots list */}
        <div className="space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Lotes ({lotes.length})
          </div>
          {lotes.map((lote) => (
            <button
              key={lote.id}
              onClick={() => setSelected(lote)}
              className={`w-full rounded-xl border bg-card p-3 text-left transition card-hover ${
                selected?.id === lote.id ? "border-primary" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{lote.nombre}</div>
                <span
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: lote.color }}
                >
                  {lote.cultivo}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{lote.hectareas} ha</span>
                <span className="font-mono">{lote.rinde} qq/ha</span>
              </div>
            </button>
          ))}
        </div>

        {/* Side panel */}
        <AnimatePresence>
          {selected && (
            <motion.aside
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto border-l border-border bg-card/85 p-6 glass scrollbar-thin"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
                    Lote seleccionado
                  </div>
                  <h2 className="mt-1 text-2xl font-bold">{selected.nombre}</h2>
                  <div className="text-sm text-muted-foreground">
                    {selected.hectareas} ha · {selected.cultivo}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-full border border-border p-2 text-muted-foreground transition hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                <SoilStat label="PH" value={selected.ph.toFixed(1)} />
                <SoilStat label="N" value={selected.nitrogeno} />
                <SoilStat label="P" value={selected.fosforo} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <SoilStat label="NDVI" value={selected.ndvi.toFixed(2)} />
                <SoilStat label="Humedad" value={`${selected.humedad}%`} />
              </div>

              <div className="mt-6 rounded-2xl border border-primary/40 bg-primary/10 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <div className="font-mono text-[10px] uppercase tracking-wider">
                    Insight IA
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{selected.recomendacion}</p>
              </div>

              <div className="mt-6">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Historial de campañas
                </div>
                <ul className="mt-2 space-y-1.5">
                  {selected.historial.map((h) => (
                    <li
                      key={h}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <button className="mt-8 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
                Planificar próxima siembra
              </button>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function LoteLabel({ points, nombre, ha }: { points: string; nombre: string; ha: number }) {
  // simple centroid
  const pts = points.split(" ").map((p) => p.split(",").map(Number));
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return (
    <g pointerEvents="none">
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="white"
        style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.6)", strokeWidth: 3 }}
      >
        {nombre}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fontSize={10}
        fill="rgba(255,255,255,0.7)"
        style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.5)", strokeWidth: 2 }}
      >
        {ha} ha
      </text>
    </g>
  );
}

function SoilStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-data text-lg font-semibold">{value}</div>
    </div>
  );
}
