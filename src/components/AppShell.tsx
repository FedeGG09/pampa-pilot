import { Link, Outlet } from '@tanstack/react-router'
import {
  Menu,
  Bell,
  Map,
  Wrench,
  Calculator,
  Orbit,
  ChartNoAxesCombined,
} from 'lucide-react'
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
] as const

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--background)] text-stone-900">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            'flex flex-col border-r border-stone-200 bg-white/80 backdrop-blur',
            collapsed ? 'w-[84px]' : 'w-[280px]',
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-4">
            {!collapsed && (
              <div>
                <div className="text-sm font-semibold tracking-[0.22em] text-stone-500">
                  PAMPA-PILOT
                </div>
                <div className="text-lg font-semibold text-stone-900">
                  AgroCopilot AI
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="rounded-2xl p-2 text-stone-500 transition hover:bg-stone-100"
              aria-label="Contraer navegación"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 p-3">
            {navigation.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeProps={() => ({
                  className:
                    'bg-[var(--primary)] text-white shadow-sm border-transparent',
                })}
                inactiveProps={() => ({
                  className: 'text-stone-700 hover:bg-stone-100',
                })}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium transition',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            ))}
          </nav>

          <div className="border-t border-stone-200 p-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
              Base API
            </div>
            {!collapsed && (
              <div className="break-all rounded-2xl bg-stone-50 px-3 py-2 text-xs text-stone-700">
                {getApiBaseUrl()}
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-stone-200 bg-white/70 px-6 py-4 backdrop-blur">
            <div>
              <p className="text-sm text-stone-500">Campaña 2026/27</p>
              <h1 className="text-xl font-semibold text-stone-900">
                Sistema operativo inteligente del agro argentino
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-100">
                Conectado a la nube
              </Badge>
              <button
                type="button"
                className="rounded-2xl border border-stone-200 bg-white p-2 text-stone-600 transition hover:bg-stone-50"
                aria-label="Notificaciones"
              >
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}