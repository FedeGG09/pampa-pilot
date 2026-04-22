import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Leaf,
  MapPinned,
  NotebookPen,
  Sparkles,
  Tractor,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const quickLinks = [
  {
    to: "/mapa",
    title: "Mapa de lotes",
    description: "NDVI, ambiente y lectura agronómica.",
    icon: MapPinned,
  },
  {
    to: "/asesor",
    title: "Asesor técnico",
    description: "DTC, síntomas y acciones correctivas.",
    icon: Sparkles,
  },
  {
    to: "/maquinaria",
    title: "Maquinaria",
    description: "Diagnóstico y soporte operativo.",
    icon: Tractor,
  },
  {
    to: "/finanzas",
    title: "Finanzas / Macro",
    description: "DEX, insumos y cobertura de margen.",
    icon: TrendingUp,
  },
];

function HomePage() {
  return (
    <div className="space-y-8 pb-16 md:pb-0">
      <PageHeader
        eyebrow="Cottagecore field OS"
        title="AgroCopilot AI"
        subtitle="Decisiones técnicas y económicas con lectura de lote, estética de cuaderno de campo y estructura clara para operar rápido."
      />

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="paper-card p-7 md:p-10">
          <div className="flex flex-wrap gap-2">
            <span className="paper-chip">RAG técnico</span>
            <span className="paper-chip">Suelos INTA</span>
            <span className="paper-chip">Finanzas agro</span>
          </div>

          <div className="mt-6 max-w-3xl">
            <h2 className="hero-script text-5xl leading-none text-[#4e362d] md:text-6xl">
              Un panel que se siente como una libreta de campo.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#6f5a4d] md:text-lg">
              Ordené la navegación, bajé el ruido visual y dejé las pantallas con más aire, más jerarquía y
              una paleta cálida para que el productor lea rápido qué pasa, qué riesgo hay y qué conviene hacer.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="paper-card-soft p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8b6c57]">
                Lógica
              </div>
              <div className="mt-2 text-xl font-semibold text-[#4e362d]">Sin tocar funciones</div>
              <p className="mt-2 text-sm leading-6 text-[#725d4f]">
                Todo el backend visual se reorganiza sin romper los handlers ni las rutas.
              </p>
            </div>

            <div className="paper-card-soft p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8b6c57]">
                UI
              </div>
              <div className="mt-2 text-xl font-semibold text-[#4e362d]">Más editorial</div>
              <p className="mt-2 text-sm leading-6 text-[#725d4f]">
                Bordes suaves, fondos crema, acentos sage y tarjetas tipo polaroid.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="paper-card p-6">
            <div className="paper-kicker">Signal board</div>
            <div className="mt-4 space-y-4">
              {[
                ["Biomasa", "NDVI bajo → conviene mirar ambiente primero."],
                ["Suelo", "Pergamino / Solís según reserva útil."],
                ["Margen", "DEX y costo energético mueven la decisión."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-[22px] border border-[rgba(91,69,52,0.08)] bg-white/75 p-4">
                  <div className="text-sm font-semibold text-[#4e362d]">{title}</div>
                  <div className="mt-1 text-sm leading-6 text-[#725d4f]">{text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="paper-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9d7c6] text-[#4e362d]">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#4e362d]">Feel this.</div>
                <div className="text-sm text-[#725d4f]">Más suave, más legible, más agro.</div>
              </div>
            </div>

            <div className="mt-4 rounded-[22px] border border-dashed border-[#d9c7b6] bg-[#fbf7f1] p-4">
              <p className="text-sm leading-6 text-[#5b473a]">
                La pantalla inicial ahora funciona como un tablero de entrada: entra la mirada, entiende la situación y sale a la ruta correcta.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map(({ to, title, description, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="paper-card group flex h-full flex-col justify-between p-5 transition-transform duration-200 hover:-translate-y-1"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1e3d5] text-[#4e362d]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-[#4e362d]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#725d4f]">{description}</p>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#7a5e4c]">
              Abrir
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </section>

      <section className="paper-card p-6 md:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5d8c5] text-[#4e362d]">
            <NotebookPen className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#4e362d]">Modo operativo</div>
            <div className="text-sm text-[#725d4f]">Cada pantalla conserva su función; solo cambia la forma de mostrarla.</div>
          </div>
        </div>
      </section>
    </div>
  );
}