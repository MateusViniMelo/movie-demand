"use client";

import { useEffect, useRef, useState } from "react";

export function SinopseFicha({ texto }: { texto: string }) {
  const [aberta, setAberta] = useState(false);
  const [cortada, setCortada] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

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
    <>
      <p
        id="ficha-sinopse"
        ref={ref}
        className={`mt-4 max-w-md text-base leading-relaxed break-words text-white/90 ${aberta ? "" : "line-clamp-3"}`}
      >
        {texto}
      </p>
      {cortada || aberta ? (
        <button
          type="button"
          className="mt-3 inline-flex h-11 cursor-pointer touch-manipulation items-center self-start rounded-full bg-black/70 px-4 text-sm text-white motion-safe:transition-transform motion-safe:duration-150 hover:bg-black/85 motion-safe:active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-expanded={aberta}
          aria-controls="ficha-sinopse"
          onClick={() => setAberta((valor) => !valor)}
        >
          {aberta ? "Recolher sinopse" : "Mostrar sinopse completa"}
        </button>
      ) : null}
    </>
  );
}
