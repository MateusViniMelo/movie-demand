"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Busca } from "@/components/busca";

export function Topo({
  modo = "painel",
  textoInicial = "",
  comBusca = true,
}: {
  modo?: "painel" | "pagina";
  textoInicial?: string;
  comBusca?: boolean;
}) {
  const [solido, setSolido] = useState(modo === "pagina");

  useEffect(() => {
    let quadro = 0;
    const aoRolar = () => {
      if (quadro) return;
      quadro = window.requestAnimationFrame(() => {
        quadro = 0;
        setSolido(modo === "pagina" || window.scrollY > 24);
      });
    };
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      window.removeEventListener("scroll", aoRolar);
      if (quadro) window.cancelAnimationFrame(quadro);
    };
  }, [modo]);

  function alternarTema() {
    const proximoEscuro = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", proximoEscuro);
    localStorage.setItem("tema", proximoEscuro ? "escuro" : "claro");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", proximoEscuro ? "#141414" : "#f3f3f3");
  }

  return (
    <header
      className={`page-gutter fixed inset-x-0 top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] ${
        solido
          ? "bg-stage/95 text-stage-ink"
          : "bg-gradient-to-b from-black/85 to-transparent text-white"
      } pt-[max(0.75rem,env(safe-area-inset-top))] pb-3`}
    >
      <p className="font-display text-2xl leading-none tracking-wide text-brand sm:text-3xl">
        Cineverso
      </p>
      {comBusca ? (
        <div className="col-span-2 min-w-0 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:w-full sm:max-w-sm sm:justify-self-end">
          <Busca modo={modo} textoInicial={textoInicial} />
        </div>
      ) : null}
      <button
        type="button"
        onClick={alternarTema}
        className={`col-start-2 row-start-1 inline-flex size-11 shrink-0 cursor-pointer touch-manipulation items-center justify-center justify-self-end rounded-full motion-safe:transition-transform motion-safe:duration-150 motion-safe:active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:col-start-3 ${
          solido
            ? "bg-stage-elev text-stage-ink hover:bg-stage-ink/10"
            : "bg-black/70 text-white hover:bg-black/85"
        }`}
      >
        <span className="grid size-5 place-items-center">
          <Moon
            aria-hidden="true"
            strokeWidth={1.75}
            className="col-start-1 row-start-1 size-5 motion-safe:transition-opacity motion-safe:duration-200 dark:opacity-0"
          />
          <Sun
            aria-hidden="true"
            strokeWidth={1.75}
            className="col-start-1 row-start-1 size-5 opacity-0 motion-safe:transition-opacity motion-safe:duration-200 dark:opacity-100"
          />
        </span>
        <span className="sr-only dark:hidden">Tema escuro</span>
        <span className="sr-only hidden dark:inline">Tema claro</span>
      </button>
    </header>
  );
}
