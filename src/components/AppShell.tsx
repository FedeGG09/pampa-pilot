import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Map,
  Sparkles,
  Tractor,
  TrendingUp,
  Wifi,
  Bell,
  User,
  Leaf,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/mapa", label: "Mapa de Lotes", icon: Map },
  { to: "/asesor", label: "Asesor IA", icon: Sparkles },
  { to: "/maquinaria", label: "Maquinaria", icon: Tractor },
  { to: "/finanzas", label: "Finanzas / Macro", icon: TrendingUp },
] as const;

export function AppShell() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground grid-bg">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 neon-border">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">AgroCopilot</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              AI · v2026.1
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6">
          {nav.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_var(--accent-lime)]"
                  />
                )}
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-xl bg-card/60 p-3 glass">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-mono uppercase tracking-wider">Online</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Datos cacheados · listo para campo
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-col md:pl-[240px]">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/70 px-4 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1.5 text-xs">
              <Wifi className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-muted-foreground">
                <span className="text-primary">●</span> Sincronizado hace 5 min
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/40 text-muted-foreground transition hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card/40 px-2 py-1.5 pr-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-medium">M. Sosa</div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  Estancia La Pampa
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-sidebar/95 backdrop-blur-md md:hidden">
          {nav.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="leading-none">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
