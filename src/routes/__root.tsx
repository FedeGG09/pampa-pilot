import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AgroCopilot AI" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: Root,
});

function Root() {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#F5EFE6] text-[#4E362D]">
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-white/70 backdrop-blur px-6 py-4 flex justify-between">
            <h1 className="font-semibold text-lg">🌾 AgroCopilot</h1>
            <nav className="flex gap-6 text-sm">
              <Link to="/">Inicio</Link>
              <Link to="/asesor">Asesor</Link>
              <Link to="/finanzas">Finanzas</Link>
            </nav>
          </header>

          <main className="flex-1 max-w-6xl mx-auto w-full p-6">
            <Outlet />
          </main>
        </div>

        <Scripts />
      </body>
    </html>
  );
}