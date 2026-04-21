import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  X,
  Layers,
  Sparkles,
  Droplets,
  Leaf,
  BarChart3,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Wrench,
} from "lucide-react";
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
  const [showGuide, setShowGuide] = useState(false);

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
                <SoilStat
                  label="NDVI"
                  value={selected.ndvi.toFixed(2)}
                  highlight={capa === "ndvi"}
                />
                <SoilStat
                  label="Humedad"
                  value={`${selected.humedad}%`}
                  highlight={capa === "humedad"}
                />
              </div>

              <div className="mt-2">
                <SoilStat
                  label="Rinde estimado"
                  value={`${selected.rinde} qq/ha`}
                  highlight={capa === "rinde"}
                />
              </div>

              <motion.div
                key={capa}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-6 rounded-2xl border border-primary/40 bg-primary/10 p-4"
              >
                <div className="flex items-center justify-between text-primary">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <div className="font-mono text-[10px] uppercase tracking-wider">
                      Insight IA · Capa {capa}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-primary/70">
                    {capas.find((c) => c.id === capa)?.label}
                  </span>
                </div>
                <div className="mt-2 text-sm font-semibold">
                  {selected.insights[capa].titulo}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                  {selected.insights[capa].detalle}
                </p>
                <div className="mt-3 rounded-xl border border-primary/30 bg-background/40 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Recomendación
                  </div>
                  <p className="mt-1 text-sm leading-relaxed">
                    {selected.insights[capa].recomendacion}
                  </p>
                </div>
              </motion.div>

              <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Recomendación general
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

              <button
                onClick={() => setShowGuide(true)}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20"
              >
                <BookOpen className="h-4 w-4" />
                Ver guía de intervención
              </button>
              <button className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
                Planificar próxima siembra
              </button>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mini-manual modal */}
        <AnimatePresence>
          {selected && showGuide && (
            <GuiaIntervencion
              lote={selected}
              capa={capa}
              onClose={() => setShowGuide(false)}
            />
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

type GuiaContenido = {
  resumen: string;
  diagnosticos: { label: string; rango: string; estado: "ok" | "warn" | "crit" }[];
  pasos: string[];
  condiciones: { label: string; valor: string }[];
  ventana: string;
  insumos: string[];
};

const guiaPorCapa: Record<Capa, { titulo: string; descripcion: string }> = {
  rinde: {
    titulo: "Mini-manual · Mapa de Rinde",
    descripcion:
      "Interpretación de zonas de productividad y prescripción de manejo variable.",
  },
  ndvi: {
    titulo: "Mini-manual · Índice Verde (NDVI)",
    descripcion:
      "Lectura de vigor vegetativo y protocolos de respuesta agronómica.",
  },
  humedad: {
    titulo: "Mini-manual · Humedad de suelo",
    descripcion:
      "Balance hídrico del perfil y ventana operativa para próxima labor.",
  },
};

function buildGuia(lote: Lote, capa: Capa): GuiaContenido {
  if (capa === "rinde") {
    const top = lote.rinde >= 60;
    const mid = lote.rinde >= 35 && lote.rinde < 60;
    return {
      resumen: top
        ? "Lote de alta productividad. Estrategia: maximizar uniformidad y eficiencia de insumos."
        : mid
          ? "Productividad media con variabilidad intra-lote. Priorizar manejo por ambientes."
          : "Lote con potencial deprimido. Diagnóstico de causas estructurales antes de invertir.",
      diagnosticos: [
        {
          label: "Rinde estimado",
          rango: `${lote.rinde} qq/ha`,
          estado: top ? "ok" : mid ? "warn" : "crit",
        },
        {
          label: "Variabilidad",
          rango: top ? "Baja (<10%)" : mid ? "Media (10-25%)" : "Alta (>25%)",
          estado: top ? "ok" : mid ? "warn" : "crit",
        },
        { label: "Cultivo actual", rango: lote.cultivo, estado: "ok" },
      ],
      pasos: [
        "Descargar mapa de rinde de monitor de cosechadora (formato .shp).",
        "Cruzar con mapa de ambientes (alto/medio/bajo potencial).",
        top
          ? "Generar prescripción de fertilización variable con dosis premium en zonas alto potencial."
          : mid
            ? "Aplicar fertilización variable: +15% N en zonas alto, -10% en bajo."
            : "Programar muestreo dirigido + test de penetrometría para descartar compactación.",
        "Validar prescripción con asesor y cargar en monitor de sembradora/pulverizadora.",
      ],
      condiciones: [
        { label: "Suelo", valor: top ? "Firme, transitable" : "Variable según ambiente" },
        { label: "Equipo recomendado", valor: "Sembradora con dosis variable VRT" },
        { label: "Operador", valor: "Contratista certificado AgTech" },
      ],
      ventana: top
        ? "Próxima labor: siembra dentro de la ventana óptima del cultivo."
        : "Próxima labor: muestreo y análisis 7-15 días antes de siembra.",
      insumos: top
        ? ["Fertilizante arrancador 80 kg/ha", "Inoculante premium", "Curasemilla full"]
        : ["Análisis de suelo dirigido", "Enmienda calcárea (si pH<6)", "Fertilizante base"],
    };
  }

  if (capa === "ndvi") {
    const top = lote.ndvi >= 0.75;
    const mid = lote.ndvi >= 0.6 && lote.ndvi < 0.75;
    return {
      resumen: top
        ? "Vigor vegetativo excelente. Mantener monitoreo y no intervenir."
        : mid
          ? "Vigor moderado. Posible respuesta a refuerzo foliar o monitoreo de plagas."
          : "Estrés vegetativo evidente. Inspección a campo urgente.",
      diagnosticos: [
        {
          label: "NDVI promedio",
          rango: lote.ndvi.toFixed(2),
          estado: top ? "ok" : mid ? "warn" : "crit",
        },
        {
          label: "Cobertura",
          rango: top ? ">90%" : mid ? "70-90%" : "<70%",
          estado: top ? "ok" : mid ? "warn" : "crit",
        },
        { label: "Pasada satelital", rango: "Sentinel-2 · hace 2 días", estado: "ok" },
      ],
      pasos: [
        "Descargar imagen NDVI georreferenciada de la última pasada Sentinel-2.",
        "Identificar manchones con NDVI <0.5 y marcar puntos de inspección.",
        top
          ? "Sin intervención. Programar próxima lectura en 7 días."
          : mid
            ? "Aplicación foliar de N (UAN 15 L/ha) + monitoreo de defoliadores."
            : "Recorrida a campo: muestreo de plantas, análisis foliar y revisión de plagas.",
        "Cargar puntos críticos en GPS de pulverizadora para tratamiento sitio-específico.",
      ],
      condiciones: [
        { label: "Viento", valor: "<15 km/h para aplicación foliar" },
        { label: "Humedad relativa", valor: ">60% recomendada" },
        { label: "Equipo", valor: "Pulverizadora con corte por sección" },
      ],
      ventana: top
        ? "Sin labor inmediata. Próxima evaluación en 7 días."
        : "Próxima labor: aplicación foliar dentro de 48-72 hs.",
      insumos: top
        ? ["Solo monitoreo satelital"]
        : ["UAN 32 (15 L/ha)", "Coadyuvante siliconado", "Insecticida selectivo si plaga >umbral"],
    };
  }

  // humedad
  const top = lote.humedad >= 65;
  const mid = lote.humedad >= 50 && lote.humedad < 65;
  return {
    resumen: top
      ? "Reservas hídricas óptimas. Ventana ideal para siembra o aplicaciones."
      : mid
        ? "Humedad adecuada en superficie. Perfil profundo en descenso."
        : "Déficit hídrico marcado. Activar protocolo Niña.",
    diagnosticos: [
      {
        label: "Humedad útil",
        rango: `${lote.humedad}%`,
        estado: top ? "ok" : mid ? "warn" : "crit",
      },
      {
        label: "Perfil 0-100 cm",
        rango: top ? "Cargado" : mid ? "Parcial" : "Crítico",
        estado: top ? "ok" : mid ? "warn" : "crit",
      },
      { label: "Pronóstico 7d", rango: "Sin lluvias significativas", estado: "warn" },
    ],
    pasos: [
      "Verificar lectura de sondas capacitivas (3 puntos por lote).",
      "Cruzar con mapa de retención hídrica del suelo.",
      top
        ? "Avanzar con siembra. Calibrar profundidad a 4-5 cm."
        : mid
          ? "Postergar fertilización N hasta lluvia >15 mm. Sembrar a profundidad de humedad."
          : "Suspender labores que demanden tránsito pesado. Replantear cultivo a ciclo corto.",
      "Registrar decisión en bitácora del lote y notificar al asesor.",
    ],
    condiciones: [
      { label: "Piso", valor: top ? "Firme" : mid ? "Aceptable" : "Riesgo de compactación" },
      { label: "Profundidad de siembra", valor: top ? "4-5 cm" : mid ? "5-7 cm" : "Buscar humedad" },
      { label: "Tránsito", valor: top ? "Habilitado" : "Restringido en cabeceras" },
    ],
    ventana: top
      ? "Próxima labor: siembra dentro de los próximos 5-7 días."
      : mid
        ? "Próxima labor: monitorear y esperar precipitación >15 mm."
        : "Próxima labor: NO operar. Reevaluar en 10 días.",
    insumos: top
      ? ["Semilla curada", "Inoculante", "Fertilizante arrancador"]
      : mid
        ? ["Semilla con tratamiento extendido", "Fertilizante en línea"]
        : ["Replanteo de planificación de campaña"],
  };
}

function GuiaIntervencion({
  lote,
  capa,
  onClose,
}: {
  lote: Lote;
  capa: Capa;
  onClose: () => void;
}) {
  const meta = guiaPorCapa[capa];
  const guia = buildGuia(lote, capa);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-primary/30 bg-card p-6 shadow-2xl scrollbar-thin"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-border p-2 text-muted-foreground transition hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="h-4 w-4" />
          <div className="font-mono text-[10px] uppercase tracking-wider">{meta.titulo}</div>
        </div>
        <h2 className="mt-2 text-2xl font-bold">{lote.nombre}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{meta.descripcion}</p>

        <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
            Resumen agronómico
          </div>
          <p className="mt-1 text-sm leading-relaxed">{guia.resumen}</p>
        </div>

        <div className="mt-5">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Diagnóstico actual
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {guia.diagnosticos.map((d) => {
              const color =
                d.estado === "ok"
                  ? "border-primary/40 text-primary"
                  : d.estado === "warn"
                    ? "border-status-warning/40 text-status-warning"
                    : "border-status-error/40 text-status-error";
              return (
                <div key={d.label} className={`rounded-xl border bg-muted/20 p-3 ${color}`}>
                  <div className="font-mono text-[10px] uppercase tracking-wider opacity-80">
                    {d.label}
                  </div>
                  <div className="mt-1 font-data text-sm font-bold">{d.rango}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <Wrench className="h-3 w-3" /> Protocolo de intervención
          </div>
          <ol className="space-y-2">
            {guia.pasos.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-mono text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="leading-snug text-foreground/90">{p}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Condiciones sugeridas
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {guia.condiciones.map((c) => (
              <div key={c.label} className="rounded-xl border border-border bg-muted/20 p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </div>
                <div className="mt-1 text-sm font-semibold">{c.valor}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-primary">
              <Calendar className="h-3.5 w-3.5" />
              <div className="font-mono text-[10px] uppercase tracking-wider">
                Ventana de labor
              </div>
            </div>
            <p className="mt-1 text-sm leading-snug">{guia.ventana}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-foreground/80">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Insumos recomendados
              </div>
            </div>
            <ul className="mt-1.5 space-y-1">
              {guia.insumos.map((i) => (
                <li key={i} className="flex items-start gap-1.5 text-sm">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span className="leading-snug">{i}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-status-warning/30 bg-status-warning/5 p-3 text-xs text-status-warning">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="leading-snug">
            Guía generada por AgroCopilot AI sobre datos satelitales y de sonda. Validar siempre
            con asesor agronómico antes de operar.
          </span>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          Entendido
        </button>
      </motion.div>
    </motion.div>
  );
}

type SoilStatProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function SoilStat({ label, value, highlight }: SoilStatProps) {
  return (
    <div
      className={`rounded-xl p-3 transition ${
        highlight
          ? "border border-primary/50 bg-primary/10 ring-1 ring-primary/30"
          : "bg-muted/40"
      }`}
    >
      <div
        className={`font-mono text-[10px] uppercase tracking-wider ${
          highlight ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
      <div className="mt-1 font-data text-lg font-semibold">{value}</div>
    </div>
  );
}
