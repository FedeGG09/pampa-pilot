import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tractor, MapPin, Wrench, Send, Terminal, Sparkles, Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import { PageHeader } from "@/components/PageHeader";
import { flota, diagErrores, type Maquina, type DiagError } from "@/lib/mock-data";

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

type Line = {
  kind: "in" | "out" | "diag";
  text: string;
  diag?: DiagError;
};

const seedLog: Line[] = [
  { kind: "out", text: "AgroCopilot Diagnostic Terminal v2.3" },
  { kind: "out", text: 'Tipeá un código de error o tocá una sugerencia rápida abajo ↓' },
];

function findDiag(input: string): DiagError | undefined {
  const lower = input.toLowerCase();
  return diagErrores.find(
    (d) => lower.includes(d.code) || lower.includes(d.comando.toLowerCase()),
  );
}

function buildChecklistPdf(diag: DiagError) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  // Header bar
  doc.setFillColor(9, 13, 11);
  doc.rect(0, 0, pageW, 90, "F");
  doc.setTextColor(184, 255, 61);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("AGROCOPILOT AI · DIAGNÓSTICO TÉCNICO", margin, 36);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(`Error ${diag.code} — ${diag.titulo}`, margin, 62);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${diag.equipo} · Severidad: ${diag.severidad}`, margin, 78);

  y = 130;
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Checklist de pasos", margin, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  diag.pasos.forEach((p, i) => {
    // checkbox
    doc.setDrawColor(120);
    doc.rect(margin, y - 10, 12, 12);
    const lines = doc.splitTextToSize(`${i + 1}. ${p}`, pageW - margin * 2 - 22);
    doc.text(lines, margin + 22, y);
    y += lines.length * 14 + 8;
    if (y > 760) {
      doc.addPage();
      y = margin;
    }
  });

  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Repuestos sugeridos", margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  diag.partes.forEach((p) => {
    doc.text(`•  ${p}`, margin, y);
    y += 16;
  });

  y += 24;
  doc.setDrawColor(200);
  doc.line(margin, y, pageW - margin, y);
  y += 22;
  doc.setFontSize(10);
  doc.text("Firma técnico responsable: ____________________________", margin, y);
  y += 24;
  doc.text("Fecha: ____ / ____ / ______      Hora: ____:____", margin, y);

  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    `Generado por AgroCopilot AI · ${new Date().toLocaleString("es-AR")}`,
    margin,
    820,
  );

  doc.save(`checklist-error-${diag.code}-${diag.equipo.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

function MaquinariaPage() {
  const [active, setActive] = useState<Maquina>(flota[0]);
  const [log, setLog] = useState<Line[]>(seedLog);
  const [cmd, setCmd] = useState("");

  const submit = (raw: string) => {
    const c = raw.trim();
    if (!c) return;
    const next: Line[] = [...log, { kind: "in", text: `> ${c}` }];
    const diag = findDiag(c);
    if (diag) {
      next.push({
        kind: "diag",
        text: `→ ${diag.titulo}`,
        diag,
      });
    } else {
      next.push({
        kind: "out",
        text:
          "→ Sin coincidencia exacta en manual.\n  Sugerencia IA: revisar bitácora en menú Diagnóstico → Histórico.",
      });
    }
    setLog(next);
    setCmd("");
  };

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    submit(cmd);
  };

  const quickPick = (d: DiagError) => {
    setCmd(d.comando);
    setTimeout(() => submit(d.comando), 80);
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
        <div className="flex h-[640px] flex-col overflow-hidden rounded-2xl border border-border bg-[#06100c]">
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
            {log.map((l, i) => {
              if (l.kind === "diag" && l.diag) {
                return <DiagCard key={i} diag={l.diag} />;
              }
              return (
                <pre
                  key={i}
                  className={`whitespace-pre-wrap ${
                    l.kind === "in" ? "text-primary" : "text-foreground/85"
                  }`}
                >
                  {l.text}
                </pre>
              );
            })}
          </div>

          {/* Quick suggestions */}
          <div className="border-t border-border bg-background/30 px-3 py-2">
            <div className="mb-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              <Sparkles className="mr-1 inline h-3 w-3" /> Sugerencias rápidas
            </div>
            <div className="flex flex-wrap gap-1.5">
              {diagErrores.map((d) => (
                <button
                  key={d.code}
                  onClick={() => quickPick(d)}
                  className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition hover:bg-primary/20"
                >
                  {d.label}
                </button>
              ))}
            </div>
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

function DiagCard({ diag }: { diag: DiagError }) {
  const sevColor =
    diag.severidad === "Crítica"
      ? "text-status-error border-status-error/40 bg-status-error/10"
      : diag.severidad === "Alta"
        ? "text-status-warning border-status-warning/40 bg-status-warning/10"
        : "text-primary border-primary/40 bg-primary/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-2 rounded-xl border border-primary/30 bg-background/60 p-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Manual técnico · Error {diag.code}
          </div>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${sevColor}`}
        >
          {diag.severidad}
        </span>
      </div>
      <div className="mt-1.5 font-sans text-sm font-semibold text-foreground">
        {diag.titulo}
      </div>
      <div className="font-sans text-[11px] text-muted-foreground">{diag.equipo}</div>

      <ul className="mt-2.5 space-y-1.5">
        {diag.pasos.map((p, i) => (
          <li key={i} className="flex items-start gap-2 font-sans text-[12px] leading-snug">
            <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-primary/40 bg-primary/5 font-mono text-[9px] font-bold text-primary">
              {i + 1}
            </span>
            <span className="text-foreground/90">{p}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 rounded-lg border border-border bg-muted/20 p-2">
        <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          Repuestos sugeridos
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {diag.partes.map((p) => (
            <span
              key={p}
              className="rounded border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-foreground/80"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => buildChecklistPdf(diag)}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 font-sans text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        <Download className="h-3.5 w-3.5" />
        Descargar checklist PDF
      </button>
    </motion.div>
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
