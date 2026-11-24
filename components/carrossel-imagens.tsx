"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Swiper as InstanciaSwiper } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const VELOCIDADE = 300;

const seta =
  "inline-flex size-11 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full bg-stage-elev text-stage-ink shadow-sm ring-1 ring-black/25 motion-safe:transition motion-safe:duration-150 hover:bg-stage-ink/10 motion-safe:active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:text-stage-muted disabled:hover:bg-stage-elev disabled:active:scale-100 dark:ring-white/25";

export function CarrosselImagens({
  imagens,
}: {
  imagens: { src: string; alt: string; tipo: string; chave?: string }[];
}) {
  const swiperRef = useRef<InstanciaSwiper | null>(null);
  const fecharRef = useRef<HTMLButtonElement | null>(null);
  const gatilhoRef = useRef<HTMLElement | null>(null);
  const [indice, setIndice] = useState(0);
  const [noInicio, setNoInicio] = useState(true);
  const [noFim, setNoFim] = useState(false);
  const [ampliada, setAmpliada] = useState<number | null>(null);

  function marcarBordas(instancia: InstanciaSwiper) {
    setNoInicio(instancia.isBeginning);
    setNoFim(instancia.isEnd);
    setIndice(instancia.activeIndex);
  }

  function abrirAmpliacao(i: number, gatilho: HTMLElement) {
    gatilhoRef.current = gatilho;
    setAmpliada(i);
  }

  function fecharAmpliacao() {
    setAmpliada(null);
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const aplicar = () => {
      const swiper = swiperRef.current;
      if (!swiper) return;
      swiper.params.speed = media.matches ? 0 : VELOCIDADE;
    };
    aplicar();
    media.addEventListener("change", aplicar);
    return () => media.removeEventListener("change", aplicar);
  }, []);

  useEffect(() => {
    if (ampliada === null) return;
    swiperRef.current?.slideTo(ampliada);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => fecharRef.current?.focus(), 0);

    function aoTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        setAmpliada(null);
        return;
      }
      if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        setAmpliada((atual) => {
          if (atual === null || atual <= 0) return atual;
          return atual - 1;
        });
        return;
      }
      if (evento.key === "ArrowRight") {
        evento.preventDefault();
        setAmpliada((atual) => {
          if (atual === null || atual >= imagens.length - 1) return atual;
          return atual + 1;
        });
      }
    }

    document.addEventListener("keydown", aoTecla);
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", aoTecla);
      gatilhoRef.current?.focus();
    };
  }, [ampliada, imagens.length]);

  if (imagens.length === 0) return null;

  const imagemAmpliada = ampliada === null ? null : imagens[ampliada];

  return (
    <>
      <div
        className="fileira-trilho relative"
        data-pode-voltar={noInicio ? undefined : ""}
        data-pode-avancar={noFim ? undefined : ""}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Imagens do filme"
      >
        <Swiper
          wrapperTag="ul"
          slidesPerView={1}
          spaceBetween={0}
          speed={VELOCIDADE}
          lazyPreload={false}
          watchOverflow
          onSwiper={(instancia) => {
            swiperRef.current = instancia;
            marcarBordas(instancia);
          }}
          onSlideChange={marcarBordas}
          onResize={marcarBordas}
          className="fileira-safe pb-2"
        >
          {imagens.map((imagem, i) => (
            <SwiperSlide key={imagem.chave ?? imagem.src} tag="li" className="w-full!">
              <button
                type="button"
                className="group relative block w-full cursor-zoom-in overflow-hidden rounded-[4px] bg-[#1c1816] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                aria-label={`Ampliar ${imagem.alt}`}
                onClick={(evento) => abrirAmpliacao(i, evento.currentTarget)}
              >
                <div
                  className={
                    imagem.tipo === "poster"
                      ? "relative mx-auto aspect-[2/3] w-[min(100%,16rem)] sm:w-[min(100%,18rem)]"
                      : "relative aspect-video w-full"
                  }
                >
                  <Image
                    src={imagem.src}
                    alt={imagem.alt}
                    fill
                    sizes={
                      imagem.tipo === "poster"
                        ? "(max-width: 640px) 256px, 288px"
                        : "(max-width: 640px) 100vw, 768px"
                    }
                    className="object-cover motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-[1.02]"
                  />
                </div>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          type="button"
          disabled={noInicio}
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="Imagem anterior"
          className={`${seta} fileira-seta fileira-seta-esq`}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={noFim}
          onClick={() => swiperRef.current?.slideNext()}
          aria-label="Próxima imagem"
          className={`${seta} fileira-seta fileira-seta-dir`}
        >
          <ChevronRight aria-hidden="true" />
        </button>
        {imagens.length > 1 ? (
          <div
            className="mt-3 flex flex-wrap items-center justify-center gap-2"
            role="group"
            aria-label="Slides das imagens"
          >
            {imagens.map((imagem, i) => {
              const ativo = i === indice;
              return (
                <button
                  key={`dot-${imagem.chave ?? imagem.src}`}
                  type="button"
                  aria-current={ativo ? "true" : undefined}
                  aria-label={`Ir para imagem ${i + 1} de ${imagens.length}`}
                  className={`h-2.5 cursor-pointer touch-manipulation rounded-full motion-safe:transition-[width,background-color] motion-safe:duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    ativo
                      ? "w-6 bg-brand"
                      : "w-2.5 bg-white/35 hover:bg-white/55"
                  }`}
                  onClick={() => swiperRef.current?.slideTo(i)}
                />
              );
            })}
          </div>
        ) : null}
        <span className="sr-only" aria-live="polite">
          Imagem {indice + 1} de {imagens.length}
        </span>
      </div>

      {imagemAmpliada && ampliada !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={imagemAmpliada.alt}
          onClick={fecharAmpliacao}
        >
          <button
            ref={fecharRef}
            type="button"
            aria-label="Fechar imagem ampliada"
            className={`${seta} absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))]`}
            onClick={fecharAmpliacao}
          >
            <X aria-hidden="true" className="size-5" />
          </button>
          {imagens.length > 1 ? (
            <>
              <button
                type="button"
                disabled={ampliada <= 0}
                aria-label="Imagem anterior ampliada"
                className={`${seta} absolute top-1/2 left-[max(0.75rem,env(safe-area-inset-left))] -translate-y-1/2`}
                onClick={(evento) => {
                  evento.stopPropagation();
                  setAmpliada((atual) => (atual === null || atual <= 0 ? atual : atual - 1));
                }}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={ampliada >= imagens.length - 1}
                aria-label="Próxima imagem ampliada"
                className={`${seta} absolute top-1/2 right-[max(0.75rem,env(safe-area-inset-right))] -translate-y-1/2`}
                onClick={(evento) => {
                  evento.stopPropagation();
                  setAmpliada((atual) =>
                    atual === null || atual >= imagens.length - 1 ? atual : atual + 1,
                  );
                }}
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </>
          ) : null}
          <div
            className="relative w-full max-w-5xl"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div
              className={
                imagemAmpliada.tipo === "poster"
                  ? "relative mx-auto h-[min(90dvh,56rem)] w-full max-w-md"
                  : "relative aspect-video w-full"
              }
            >
              <Image
                src={imagemAmpliada.src}
                alt={imagemAmpliada.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-contain"
                priority
              />
            </div>
            {imagens.length > 1 ? (
              <p className="mt-3 text-center text-sm text-white/80 tabular-nums">
                {ampliada + 1} / {imagens.length}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
