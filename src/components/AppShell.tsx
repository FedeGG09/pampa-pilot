import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  ChevronRight,
  Home,
  Leaf,
  MapPinned,
  NotebookPen,
  Sparkles,
  Sprout,
  Tractor,
  TrendingUp,
  SunMedium,
} from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  caption: string;
  icon: typeof Home;
  exact?: boolean;
};

const nav: NavItem[] = [
  { to: "/", label: "Inicio", caption: "Resumen del sistema", icon: Home, exact: true },
  { to: "/mapa", label: "Mapa", caption: "NDVI y ambientes", icon: MapPinned },
  { to: "/asesor", label: "Asesor", caption: "DTC y diagnóstico", icon: Sparkles },
  { to: "/maquinaria", label: "Maquinaria", caption: "Protocolos y fallas", icon: Tractor },
  { to: "/finanzas", label: "Finanzas", caption: "Margen y cobertura", icon: TrendingUp },
];

export function AppShell() {
  const location = useLocation();

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(201,173,147,0.28),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(163,185,150,0.24),_transparent_24%),linear-gradient(180deg,_#faf6ef_0%,_#f5efe3_48%,_#efe6d7_100%)] text-[color:var(--foreground)]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.34] [background-image:linear-gradient(to_right,rgba(83,63,48,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(83,63,48,0.05)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[312px] shrink-0 border-r border-[rgba(91,69,52,0.10)] bg-[rgba(255,250,242,0.72)] px-5 py-6 backdrop-blur-md md:flex md:flex-col">
          <div className="rounded-[28px] border border-[rgba(91,69,52,0.10)] bg-white/75 p-5 shadow-[0_20px_60px_-34px_rgba(72,54,39,0.45)]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-[rgba(91,69,52,0.10)] bg-[#f0e2d3] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <Sprout className="h-7 w-7 text-[#6f8b61]" />
              </div>

              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6c57]">
                  AgroCopilot AI
                </div>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#4e362d]">
                  Pampa Pilot
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#7a6353]">
                  Un panel sobrio, cálido y legible para decisiones de lote, maquinaria y margen.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f7efe4] px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[#8c7260]">Estado</div>
                <div className="mt-1 flex items-center gap-2 text-sm font-medium text-[#4e362d]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#8db26f]" />
                  Operativo
                </div>
              </div>
              <div className="rounded-2xl bg-[#f7efe4] px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[#8c7260]">Ciclo</div>
                <div className="mt-1 text-sm font-medium text-[#4e362d]">2026 / 27</div>
              </div>
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-2">
            {nav.map((item) => {
              const active = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    "group flex items-center gap-4 rounded-[24px] border px-4 py-4 transition-all duration-200",
                    active
                      ? "border-[#cdb39b] bg-white/80 shadow-[0_14px_40px_-24px_rgba(72,54,39,0.38)]"
                      : "border-transparent bg-transparent hover:border-[rgba(91,69,52,0.08)] hover:bg-white/55",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-2xl transition-colors",
                      active ? "bg-[#e9d7c6] text-[#4e362d]" : "bg-[#f3ece2] text-[#6c584a]",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#4e362d]">{item.label}</span>
                      {active ? <BadgeCheck className="h-4 w-4 text-[#8db26f]" /> : null}
                    </div>
                    <div className="mt-1 text-sm text-[#7a6353]">{item.caption}</div>
                  </div>

                  <ChevronRight
                    className={[
                      "h-4 w-4 transition-transform",
                      active ? "translate-x-0 text-[#8b6c57]" : "-translate-x-0.5 text-[#a99383] group-hover:translate-x-0",
                    ].join(" ")}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[28px] border border-[rgba(91,69,52,0.10)] bg-white/78 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#efe0d1]">
                <NotebookPen className="h-5 w-5 text-[#6f8b61]" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#4e362d]">Notas de campo</div>
                <div className="text-sm text-[#7a6353]">Consumo, biomasa, suelos y decisiones.</div>
              </div>
            </div>

            <div className="mt-4 rounded-[22px] border border-dashed border-[#d8c3ae] bg-[#fbf7f1] p-4">
              <p className="text-sm leading-6 text-[#5a4537]">
                "Feel this." El panel ahora debería verse como un cuaderno curado: más aire, más jerarquía y menos ruido.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[rgba(91,69,52,0.08)] bg-[rgba(250,246,239,0.86)] px-4 py-4 backdrop-blur-md md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6c57]">
                  <SunMedium className="h-3.5 w-3.5" />
                  Panel de decisión
                </div>
                <div className="mt-1 text-lg font-semibold text-[#4e362d]">
                  AgroCopilot AI
                </div>
              </div>

              <div className="hidden flex-wrap items-center gap-2 md:flex">
                <span className="rounded-full border border-[rgba(91,69,52,0.10)] bg-white/80 px-3 py-1 text-xs text-[#6b5447]">
                  Suelos + clima
                </span>
                <span className="rounded-full border border-[rgba(91,69,52,0.10)] bg-white/80 px-3 py-1 text-xs text-[#6b5447]">
                  RAG técnico
                </span>
                <span className="rounded-full border border-[rgba(91,69,52,0.10)] bg-white/80 px-3 py-1 text-xs text-[#6b5447]">
                  Finanzas agro
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 lg:px-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(91,69,52,0.10)] bg-[rgba(251,247,240,0.94)] px-2 py-2 backdrop-blur-md md:hidden">
            <div className="grid grid-cols-5 gap-1">
              {nav.map((item) => {
                const active = item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={[
                      "flex flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] transition-colors",
                      active ? "bg-white text-[#4e362d]" : "text-[#8a7768]",
                    ].join(" ")}
                  >
                    <Icon className={["mb-1 h-5 w-5", active ? "text-[#6f8b61]" : "text-current"].join(" ")} />
                    <span className="leading-none">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}