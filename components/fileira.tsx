"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Poster } from "@/components/poster";
import type { Filme } from "@/lib/filmes";

export function Fileira({
  titulo,
  filmes,
}: {
  titulo: string;
  filmes: Filme[];
}) {
  const lista = useRef<HTMLUListElement>(null);

  function rolar(direcao: -1 | 1) {
    const el = lista.current;
    if (!el) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direcao * Math.round(el.clientWidth * 0.85),
      behavior: reduzir ? "auto" : "smooth",
    });
  }

  if (filmes.length === 0) return null;

  return (
    <section aria-labelledby={`fileira-${titulo}`}>
      <div className="mb-2 flex items-center justify-between gap-3 px-4 sm:px-12">
        <h2
          id={`fileira-${titulo}`}
          className="font-display text-2xl leading-none tracking-tight sm:text-3xl"
        >
          {titulo}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => rolar(-1)}
            aria-label={`Rolar ${titulo} para a esquerda`}
            className="inline-flex size-11 items-center justify-center rounded-full bg-stage-elev text-stage-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => rolar(1)}
            aria-label={`Rolar ${titulo} para a direita`}
            className="inline-flex size-11 items-center justify-center rounded-full bg-stage-elev text-stage-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul
        ref={lista}
        className="fileira-scroll flex gap-2 overflow-x-auto px-4 pb-2 sm:gap-3 sm:px-12"
      >
        {filmes.map((filme) => (
          <Poster key={filme.id} filme={filme} />
        ))}
      </ul>
    </section>
  );
}
