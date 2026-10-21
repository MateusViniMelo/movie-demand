"use client";

import { useEffect, useState } from "react";

export function Topo() {
  const [solido, setSolido] = useState(false);

  useEffect(() => {
    const aoRolar = () => setSolido(window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  function alternarTema() {
    const proximoEscuro = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", proximoEscuro);
    localStorage.setItem("tema", proximoEscuro ? "escuro" : "claro");
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-3 sm:px-12 ${
        solido
          ? "bg-stage/95 text-stage-ink"
          : "bg-gradient-to-b from-black/75 to-transparent text-white"
      }`}
    >
      <p className="font-display text-3xl leading-none tracking-wide text-brand">
        Catálogo
      </p>
      <button
        type="button"
        onClick={alternarTema}
        className={`h-11 rounded-full px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          solido ? "text-stage-ink" : "text-white"
        }`}
      >
        <span className="dark:hidden">Tema escuro</span>
        <span className="hidden dark:inline">Tema claro</span>
      </button>
    </header>
  );
}
