"use client";

import Link from "next/link";

export function Voltar({ tom = "palco" }: { tom?: "palco" | "still" }) {
  const sobreStill = tom === "still";

  return (
    <Link
      href="/"
      onClick={(event) => {
        if (!document.referrer.startsWith(window.location.origin)) return;
        event.preventDefault();
        window.history.back();
      }}
      className={`group inline-flex min-h-11 items-center gap-3 self-start font-display text-[clamp(1.35rem,2.5vw,1.75rem)] leading-none tracking-wide focus-visible:outline-2 focus-visible:outline-offset-4 motion-safe:transition-colors motion-safe:duration-150 ${
        sobreStill
          ? "text-white hover:text-brand focus-visible:text-brand focus-visible:outline-white"
          : "mb-8 text-stage-ink hover:text-brand focus-visible:text-brand focus-visible:outline-brand"
      }`}
    >
      <span
        aria-hidden="true"
        className="block h-px w-10 bg-brand motion-safe:transition-transform motion-safe:duration-200 motion-safe:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:-translate-x-1.5 motion-safe:group-active:-translate-x-2.5"
      />
      Voltar
    </Link>
  );
}
