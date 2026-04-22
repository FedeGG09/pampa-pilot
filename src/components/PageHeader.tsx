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
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className="mb-3 inline-flex items-center rounded-full border border-[rgba(91,69,52,0.10)] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6c57]">
            {eyebrow}
          </div>
        ) : null}

        <h1 className="font-display text-4xl font-semibold italic tracking-tight text-[#4e362d] md:text-5xl">
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#725d4f] md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}