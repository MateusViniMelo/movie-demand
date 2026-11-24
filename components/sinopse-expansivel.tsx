"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  texto: string;
  id: string;
  className?: string;
  aberta?: boolean;
  onAbertaChange?: (aberta: boolean) => void;
};

export function SinopseExpansivel({
  texto,
  id,
  className = "text-white/90",
  aberta: abertaExterna,
  onAbertaChange,
}: Props) {
  const [abertaInterna, setAbertaInterna] = useState(false);
  const controlada = abertaExterna !== undefined;
  const aberta = controlada ? abertaExterna : abertaInterna;
  const [cortada, setCortada] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  function alternar() {
    const proxima = !aberta;
    if (!controlada) setAbertaInterna(proxima);
    onAbertaChange?.(proxima);
  }

  useEffect(() => {
    const el = ref.current;
    if (!el || aberta) return;
    const medir = () => {
      const estaCortada = el.scrollHeight > el.clientHeight + 1;
      setCortada((atual) => (atual === estaCortada ? atual : estaCortada));
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [texto, aberta]);

  if (!texto) return null;

  return (
    <div className="flex flex-col items-start">
      <p
        id={id}
        ref={ref}
        className={`mt-4 max-w-md text-base leading-relaxed break-words ${className} ${aberta ? "" : "line-clamp-3"}`}
      >
        {texto}
      </p>
      {cortada || aberta ? (
        <button
          type="button"
          className="mt-3 inline-flex h-11 cursor-pointer touch-manipulation items-center rounded-full bg-black/70 px-4 text-sm text-white motion-safe:transition-transform motion-safe:duration-150 hover:bg-black/85 motion-safe:active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-expanded={aberta}
          aria-controls={id}
          onClick={alternar}
        >
          {aberta ? "Recolher sinopse" : "Mostrar sinopse completa"}
        </button>
      ) : null}
    </div>
  );
}
