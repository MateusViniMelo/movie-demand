"use client";

import { useEffect, useState } from "react";

export function Topo() {
  const [solido, setSolido] = useState(false);

  useEffect(() => {
    let quadro = 0;
    const aoRolar = () => {
      if (quadro) return;
      quadro = window.requestAnimationFrame(() => {
        quadro = 0;
        setSolido(window.scrollY > 24);
      });
    };
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      window.removeEventListener("scroll", aoRolar);
      if (quadro) window.cancelAnimationFrame(quadro);
    };
  }, []);

  function alternarTema() {
    const proximoEscuro = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", proximoEscuro);
    localStorage.setItem("tema", proximoEscuro ? "escuro" : "claro");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", proximoEscuro ? "#141414" : "#f3f3f3");
  }

  return (
    <header
      className={`page-gutter fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 ${
        solido
          ? "bg-stage/95 text-stage-ink"
          : "bg-gradient-to-b from-black/85 to-transparent text-white"
      } pt-[max(0.75rem,env(safe-area-inset-top))] pb-3`}
    >
      <p className="font-display text-3xl leading-none tracking-wide text-brand">
        Catálogo
      </p>
      <button
        type="button"
        onClick={alternarTema}
        className={`inline-flex h-11 shrink-0 cursor-pointer touch-manipulation items-center rounded-full px-4 text-sm font-medium motion-safe:transition-transform motion-safe:duration-150 motion-safe:active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          solido
            ? "bg-stage-elev text-stage-ink hover:bg-stage-ink/10"
            : "bg-black/70 text-white hover:bg-black/85"
        }`}
      >
        <span className="dark:hidden">Tema escuro</span>
        <span className="hidden dark:inline">Tema claro</span>
      </button>
    </header>
  );
}
