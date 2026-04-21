import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Shield, Award, Leaf } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { semillas } from "@/lib/mock-data";

export const Route = createFileRoute("/asesor")({
  head: () => ({
    meta: [
      { title: "Asesor IA · AgroCopilot AI" },
      {
        name: "description",
        content:
          "Copilot de semillas e insumos. Comparativa de variedades NK, Don Mario, Pioneer y recomendación basada en IA.",
      },
    ],
  }),
  component: AsesorPage,
});

type Msg = { role: "user" | "ai"; text: string };

const initialMsgs: Msg[] = [
  {
    role: "ai",
    text:
      "Hola Mariano. Analicé tus 5 lotes y el pronóstico estacional. ¿Querés una recomendación para la próxima campaña de soja?",
  },
];

function AsesorPage() {
  const [msgs, setMsgs] = useState<Msg[]>(initialMsgs);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, thinking]);

  const send = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setMsgs((m) => [...m, { role: "user", text: value }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMsgs((m) => [
        ...m,
        {
          role: "ai",
          text:
            "Basado en tu lote 'El Ombú' (PH 6.3, N alto) y el pronóstico de año Niña, la mejor opción es **DM 40R16** (Don Mario, ciclo corto). Ofrece resistencia a roya y buena performance en años secos. Densidad sugerida: 320.000 pl/ha.",
        },
      ]);
    }, 1200);
  };

  return (
    <>
      <PageHeader
        eyebrow="Copilot de insumos"
        title="Asesor IA de Semillas"
        subtitle="Recomendación inteligente cruzando suelo, clima y catálogo 2026"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_440px]">
        {/* Cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          {semillas.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-hover relative rounded-2xl border border-border bg-card p-4"
            >
              {s.badge && (
                <div className="absolute -top-2 right-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  <Sparkles className="h-3 w-3" />
                  {s.badge}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.marca}
                </div>
                <div className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px]">
                  {s.cultivo}
                </div>
              </div>
              <div className="mt-2 text-base font-bold">{s.variedad}</div>
              <div className="mt-1 text-xs text-muted-foreground">Ciclo {s.ciclo}</div>

              <div className="mt-3 flex flex-wrap gap-1">
                {s.resistencia.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    <Shield className="h-2.5 w-2.5" />
                    {r}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  Score IA
                </div>
                <div className="font-data text-xl font-bold text-primary">{s.scoreIA}</div>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${s.scoreIA}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chat */}
        <div className="flex h-[640px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 neon-border">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">Copilot Agronómico</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="text-primary">●</span> Modelo AgroLLM-v3
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 scrollbar-thin">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-muted/60 text-foreground"
                      : "bg-[var(--surface)] text-foreground"
                  }`}
                >
                  {m.role === "ai" && (
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-primary">
                      <Leaf className="h-3 w-3" /> Copilot
                    </div>
                  )}
                  <FormattedText text={m.text} />
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-[var(--surface)] px-3.5 py-2.5">
                  <div className="flex items-center gap-1">
                    <Dot delay={0} />
                    <Dot delay={0.15} />
                    <Dot delay={0.3} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {[
                "Mejor soja para El Ombú",
                "Comparar DM 40R16 vs NK 5009",
                "Dosis de fertilizante",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Preguntá al Copilot..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

function FormattedText({ text }: { text: string }) {
  // bold **...**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <span key={i} className="neon-text font-semibold">
            {p.slice(2, -2)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
      animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
      transition={{ duration: 0.9, repeat: Infinity, delay }}
    />
  );
}
