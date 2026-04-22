import type { ReactNode } from "react";
import {
  Link,
  HeadContent,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="paper-card max-w-xl px-8 py-10 text-center">
        <div className="paper-kicker mx-auto">404 · Página no encontrada</div>

        <h1 className="mt-5 font-display text-6xl italic text-[#4e362d] md:text-7xl">
          Se fue del cuaderno
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#725d4f] md:text-base">
          La ruta que buscás no existe o fue movida. Volvé al tablero principal
          para seguir operando desde ahí.
        </p>

        <div className="mt-7 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-[rgba(91,69,52,0.10)] bg-[#f0e2d3] px-5 py-3 text-sm font-medium text-[#4e362d] transition-transform hover:-translate-y-0.5"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "AgroCopilot AI · Sistema operativo del agro argentino",
      },
      {
        name: "description",
        content:
          "Plataforma para productores agropecuarios: lotes, maquinaria, asesor IA y finanzas en tiempo real.",
      },
      { property: "og:title", content: "AgroCopilot AI" },
      {
        property: "og:description",
        content:
          "Mapa de lotes, asesor IA y monitor financiero del agro argentino.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <AppShell />;
}