import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tractor, MapPin, Wrench, Send, Terminal } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { flota, type Maquina } from "@/lib/mock-data";

export const Route = createFileRoute("/maquinaria")({
  head: () => ({
    meta: [
      { title: "Centro de Maquinaria · AgroCopilot AI" },
      {
        name: "description",
        content:
          "Telemetría de flota, health score y diagnóstico técnico asistido por IA con códigos de error del manual.",
      },
    ],
  }),
  component: MaquinariaPage,
});

type Line = { kind: "in" | "out"; text: string };

const seedLog: Line[] = [
  { kind: "out", text: "AgroCopilot Diagnostic Terminal v2.3" },
  { kind: "out", text: 'Tipeá un código de error (ej: "Error 404 cosechadora") y enter.' },
];

function MaquinariaPage() {
  const [active, setActive] = useState<Maquina>(flota[0]);
  const [log, setLog] = useState<Line[]>(seedLog);
  const [cmd, setCmd] = useState("");

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmd.trim()) return;
    const c = cmd.trim();
    const next: Line[] = [...log, { kind: "in", text: `> ${c}` }];
    let resp = "";
    if (/404/.test(c)) {
      resp =
        "→ ERROR 404 — Pérdida de presión hidráulica.\n" +
        "  1. Verificar nivel de aceite hidráulico (mín 38L).\n" +
        "  2. Inspeccionar filtro principal (P/N RE284091).\n" +
        "  3. Revisar mangueras del cabezal por fisuras.\n" +
        "  4. Si persiste, reset ECU vía menú Service → 0x4F.";
    } else if (/500|motor/i.test(c)) {
      resp =
        "→ ERROR 500 — Sobretemperatura en motor.\n" +
        "  Detener equipo. Verificar refrigerante y radiador.";
    } else {
      resp =
        "→ Sin coincidencia exacta en manual.\n" +
        "  Sugerencia IA: revisar bitácora de fallas en menú Diagnóstico → Histórico.";
    }
    setLog([...next, { kind: "out", text: resp }]);
    setCmd("");
  };

  return (
    <>
      <PageHeader
        eyebrow="Telemetría de flota"
        title="Centro de Maquinaria"
        subtitle="4 unidades operativas · 1 alerta activa · diagnóstico IA disponible"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_460px]">
        {/* Fleet */}
        <div className="grid gap-3 sm:grid-cols-2">
          {flota.map((m, i) => (
            <motion.button
              key={m.id}
              onClick={() => setActive(m)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`card-hover rounded-2xl border bg-card p-4 text-left ${
                active.id === m.id ? "border-primary" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {m.tipo}
                  </div>
                  <div className="mt-1 text-base font-bold">{m.marca}</div>
                  <div className="text-sm text-muted-foreground">{m.modelo}</div>
                </div>
                <HealthRing value={m.health} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {m.ubicacion}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Tractor className="h-3 w-3" /> {m.horas} hs
                </div>
              </div>

              {m.alerta && (
                <div className="mt-3 rounded-lg border border-status-warning/40 bg-status-warning/10 px-2.5 py-1.5 text-[11px] text-status-warning">
                  ⚠ {m.alerta}
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Diagnostic terminal */}
        <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-border bg-[#06100c]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-semibold">Diagnóstico Rápido</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {active.marca} {active.modelo} · health {active.health}%
                </div>
              </div>
            </div>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed scrollbar-thin">
            {log.map((l, i) => (
              <pre
                key={i}
                className={`whitespace-pre-wrap ${
                  l.kind === "in" ? "text-primary" : "text-foreground/85"
                }`}
              >
                {l.text}
              </pre>
            ))}
          </div>

          <form
            onSubmit={run}
            className="flex items-center gap-2 border-t border-border bg-background/50 px-3 py-2"
          >
            <span className="font-mono text-sm text-primary">$</span>
            <input
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              placeholder='ej: "error 404 cosechadora"'
              className="flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function HealthRing({ value }: { value: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color =
    value > 70 ? "var(--accent-lime)" : value > 50 ? "var(--status-warning)" : "var(--status-error)";
  return (
    <div className="relative h-14 w-14">
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
        <circle cx="28" cy="28" r={r} stroke="oklch(1 0 0 / 0.08)" strokeWidth="5" fill="none" />
        <circle
          cx="28"
          cy="28"
          r={r}
          stroke={color}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-data text-xs font-bold">{value}</span>
      </div>
    </div>
  );
}
