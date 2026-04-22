import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/AppShell'
import { DashboardPage } from '@/pages/dashboard-page'
import { MapPage } from '@/pages/map-page'
import { DtcPage } from '@/pages/dtc-page'
import { FinancePage } from '@/pages/finance-page'
import { OrchestratorPage } from '@/pages/orchestrator-page'
import { NotFoundPage } from '@/pages/not-found-page'

const rootRoute = createRootRoute({
  component: AppShell,
  notFoundComponent: NotFoundPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' })
  },
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dashboard',
  component: DashboardPage,
})

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'mapa',
  component: MapPage,
})

const dtcRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dtc',
  component: DtcPage,
})

const financeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'finanzas',
  component: FinancePage,
})

const orchestratorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'orquestador',
  component: OrchestratorPage,
})

const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute, mapRoute, dtcRoute, financeRoute, orchestratorRoute])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  notFoundMode: 'fuzzy',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
