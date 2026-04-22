import { NavLink, Outlet } from '@tanstack/react-router'
import { Menu, Bell, Leaf, Map, Wrench, Calculator, Orbit, ChartNoAxesCombined } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getApiBaseUrl } from '@/lib/api'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: ChartNoAxesCombined },
  { to: '/mapa', label: 'Mapa de Lotes', icon: Map },
  { to: '/dtc', label: 'Asesor Técnico', icon: Wrench },
  { to: '/finanzas', label: 'Simulador Financiero', icon: Calculator },
  { to: '/orquestador', label: 'Orquestador AI', icon: Orbit },
]

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--bg)] text-stone-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className={cn('sticky top-0 hidden h-screen flex-col border-r border-white/70 bg-white/80 backdrop-blur lg:flex', collapsed ? 'w-[92px]' : 'w-[280px]')}>
          <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-5 py-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-white shadow-sm">
                <Leaf className="h-6 w-6" />
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm font-semibold text-[var(--secondary)]">AgroCopilot AI</p>
                  <p className="text-xs tracking-[0.15em] text-stone-500">PAMPA-PILOT</p>
                </div>
              )}
            </div>
            <button onClick={() => setCollapsed((v) => !v)} className="rounded-2xl p-2 text-stone-500 transition hover:bg-stone-100" aria-label="Contraer navegación">
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 px-3 py-4">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn('flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition', isActive ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-stone-700 hover:bg-stone-100')
                }
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="p-4">
            <div className="rounded-3xl border border-[rgba(107,142,35,0.15)] bg-[rgba(107,142,35,0.06)] p-4">
              <p className="text-sm font-semibold text-[var(--secondary)]">Base API</p>
              {!collapsed && <p className="mt-1 break-all text-xs text-stone-600">{getApiBaseUrl()}</p>}
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 border-b border-white/70 bg-white/85 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-6">
              <div>
                <h1 className="text-xl font-semibold text-stone-900 lg:text-2xl">Dashboard</h1>
                <p className="text-sm text-stone-500">Campaña 2026/27</p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="success" className="hidden md:inline-flex">Conectado a la nube</Badge>
                <button className="rounded-2xl p-2 text-stone-500 transition hover:bg-stone-100" aria-label="Alertas">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-3 py-2">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80" alt="Productor Demo" className="h-10 w-10 rounded-full object-cover" />
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">Productor Demo</p>
                    <p className="text-xs text-stone-500">Establecimiento La Esperanza</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
