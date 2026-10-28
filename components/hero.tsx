"use client";

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const INTERVALO = 7000;

const botao =
  "inline-flex size-11 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full bg-black/70 text-white motion-safe:transition-transform motion-safe:duration-150 hover:bg-black/85 motion-safe:active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function Hero({
  filmes,
  children,
}: {
  filmes: {
    id: number;
    titulo: string;
    poster: string;
    backdrop: string | null;
    sinopse: string;
    genero: string;
    meta: string;
  }[];
  children?: ReactNode;
}) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [movimentoReduzido, setMovimentoReduzido] = useState(false);
  const [focado, setFocado] = useState(false);
  const [oculto, setOculto] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const [sinopseAberta, setSinopseAberta] = useState(false);
  const [sinopseCortada, setSinopseCortada] = useState(false);
  const [urlPronta, setUrlPronta] = useState(false);
  const sinopseRef = useRef<HTMLParagraphElement>(null);
  const anuncioInicial = useRef(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const aplicar = () => setMovimentoReduzido(media.matches);
    aplicar();
    media.addEventListener("change", aplicar);
    return () => media.removeEventListener("change", aplicar);
  }, []);

  useEffect(() => {
    const aoMudar = () => setOculto(document.hidden);
    document.addEventListener("visibilitychange", aoMudar);
    return () => document.removeEventListener("visibilitychange", aoMudar);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bruto = params.get("filme");
    const id = window.setTimeout(() => {
      if (bruto !== null) {
        const filmeId = Number(bruto);
        const achado = filmes.findIndex((item) => item.id === filmeId);
        if (achado > 0) setIndice(achado);
      }
      if (params.get("sinopse") === "1") setSinopseAberta(true);
      setUrlPronta(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [filmes]);

  useEffect(() => {
    if (!urlPronta) return;
    const filmeAtual = filmes[indice];
    if (!filmeAtual) return;
    const params = new URLSearchParams(window.location.search);
    params.set("filme", String(filmeAtual.id));
    if (sinopseAberta) params.set("sinopse", "1");
    else params.delete("sinopse");
    const consulta = params.toString();
    const destino = consulta ? `/?${consulta}` : "/";
    const atual = `${window.location.pathname}${window.location.search}`;
    if (atual !== destino) History.prototype.replaceState.call(window.history, null, "", destino);
  }, [urlPronta, indice, sinopseAberta, filmes]);

  useEffect(() => {
    if (anuncioInicial.current) {
      anuncioInicial.current = false;
      return;
    }
    const atual = filmes[indice];
    if (!atual) return;
    const id = window.setTimeout(() => {
      setAnuncio(`${atual.titulo}. Filme ${indice + 1} de ${filmes.length}.`);
    }, 0);
    return () => window.clearTimeout(id);
  }, [indice, filmes]);

  useEffect(() => {
    if (pausado || movimentoReduzido || focado || oculto || filmes.length < 2) return;
    const id = window.setInterval(() => {
      setIndice((atual) => (atual + 1) % filmes.length);
      setSinopseAberta(false);
      setSinopseCortada(false);
    }, INTERVALO);
    return () => window.clearInterval(id);
  }, [pausado, movimentoReduzido, focado, oculto, filmes.length, indice]);

  const filme = filmes[indice] ?? filmes[0];

  useEffect(() => {
    const el = sinopseRef.current;
    if (!el || sinopseAberta) return;
    const medir = () => {
      const cortada = el.scrollHeight > el.clientHeight + 1;
      setSinopseCortada((atual) => (atual === cortada ? atual : cortada));
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [filme?.sinopse, filme?.id, sinopseAberta]);

  if (!filme) return null;

  const fundo = filme.backdrop ?? filme.poster;

  function passar(delta: number) {
    setIndice((atual) => (atual + delta + filmes.length) % filmes.length);
    setSinopseAberta(false);
    setSinopseCortada(false);
  }

  function aoTeclar(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key !== "ArrowRight" && evento.key !== "ArrowLeft") return;
    evento.preventDefault();
    passar(evento.key === "ArrowRight" ? 1 : -1);
  }

  function aoDesfocar(evento: FocusEvent<HTMLElement>) {
    if (!evento.currentTarget.contains(evento.relatedTarget)) setFocado(false);
  }

  return (
    <>
      <section
        aria-labelledby="conteudo"
        aria-roledescription="carrossel"
        className="relative min-h-[78vh]"
        onFocus={() => setFocado(true)}
        onBlur={aoDesfocar}
      >
        {indice === 0 ? (
          <Image
            key={fundo}
            src={fundo}
            alt=""
            fill
            sizes="100vw"
            preload={true}
            className="object-cover"
          />
        ) : (
          <Image
            key={fundo}
            src={fundo}
            alt=""
            fill
            sizes="100vw"
            loading="eager"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-stage to-transparent" />
        <div className="page-gutter relative z-10 flex min-h-[78vh] min-w-0 max-w-xl flex-col justify-end pt-28 pb-28">
          <p className="text-sm tracking-wide text-white">{filme.genero}</p>
          <h1
            id="conteudo"
            tabIndex={-1}
            className="mt-2 min-w-0 scroll-mt-28 font-display text-5xl leading-[0.95] tracking-tight break-words text-balance text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-7xl"
          >
            {filme.titulo}
          </h1>
          {filme.sinopse ? (
            <>
              <p
                id="hero-sinopse"
                ref={sinopseRef}
                className={`mt-4 max-w-md text-base leading-relaxed break-words text-white ${sinopseAberta ? "" : "line-clamp-3"}`}
              >
                {filme.sinopse}
              </p>
              {sinopseCortada || sinopseAberta ? (
                <button
                  type="button"
                  className="mt-3 inline-flex h-11 cursor-pointer touch-manipulation items-center self-start rounded-full bg-black/70 px-4 text-sm text-white motion-safe:transition-transform motion-safe:duration-150 hover:bg-black/85 motion-safe:active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  aria-expanded={sinopseAberta}
                  aria-controls="hero-sinopse"
                  onClick={() => setSinopseAberta((aberta) => !aberta)}
                >
                  {sinopseAberta ? "Recolher sinopse" : "Mostrar sinopse completa"}
                </button>
              ) : null}
            </>
          ) : null}
          {filme.meta ? <p className="mt-4 font-mono text-sm text-white tabular-nums">{filme.meta}</p> : null}
          {filmes.length > 1 ? (
            <div className="mt-6 flex gap-2" onKeyDown={aoTeclar}>
              {movimentoReduzido ? null : (
                <button
                  type="button"
                  className={botao}
                  aria-pressed={pausado}
                  aria-label={pausado ? "Retomar a troca automática" : "Pausar a troca automática"}
                  onClick={() => setPausado((valor) => !valor)}
                >
                  {pausado ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
                </button>
              )}
              <button
                type="button"
                className={botao}
                aria-label="Filme anterior"
                onClick={() => passar(-1)}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                className={botao}
                aria-label="Próximo filme"
                onClick={() => passar(1)}
              >
                <ChevronRight aria-hidden="true" />
              </button>
              <p className="self-center px-1 font-mono text-sm text-white tabular-nums">
                {indice + 1} de {filmes.length}
              </p>
            </div>
          ) : null}
          <p className="sr-only" aria-live="polite">
            {anuncio}
          </p>
        </div>
      </section>
      <div className="relative z-10 -mt-10 space-y-8 pb-[max(4rem,env(safe-area-inset-bottom))]">{children}</div>
    </>
  );
}
