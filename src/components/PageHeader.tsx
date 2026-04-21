import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-end">
      <div>
        {eyebrow && (
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary/80">
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
