// src/routes/index.tsx
import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="min-h-screen bg-[#090D0B] text-white p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-semibold">AgroCopilot AI</h1>
          <p className="max-w-2xl text-white/70">
            Front listo para conectar con backend real: asesor técnico, simulación financiera y orquestación NDVI.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <NavCard to="/asesor" title="Asesor técnico" text="Diagnóstico de DTC y acciones correctivas." />
          <NavCard to="/finanzas" title="Finanzas" text="DEX, urea, gasoil y margen por hectárea." />
          <NavCard to="/mapa" title="Mapa NDVI" text="Decisión agronómica y económica desde biomasa." />
        </div>
      </div>
    </main>
  );
}

function NavCard({ to, title, text }: { to: string; title: string; text: string }) {
  return (
    <Link to={to} className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/8 transition">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-white/70">{text}</p>
    </Link>
  );
}