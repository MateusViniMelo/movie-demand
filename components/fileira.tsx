"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Swiper as InstanciaSwiper } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Poster } from "@/components/poster";

const VELOCIDADE = 300;

const seta =
  "inline-flex size-11 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full bg-stage-elev text-stage-ink shadow-sm ring-1 ring-black/25 motion-safe:transition motion-safe:duration-150 hover:bg-stage-ink/10 motion-safe:active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:text-stage-muted disabled:hover:bg-stage-elev disabled:active:scale-100 dark:ring-white/25";

export function Fileira({
  titulo,
  filmes,
  primeiroMaior = false,
}: {
  titulo: string;
  filmes: { id: number; titulo: string; src: string }[];
  primeiroMaior?: boolean;
}) {
  const swiperRef = useRef<InstanciaSwiper | null>(null);
  const [noInicio, setNoInicio] = useState(true);
  const [noFim, setNoFim] = useState(false);

  function marcarBordas(instancia: InstanciaSwiper) {
    setNoInicio(instancia.isBeginning);
    setNoFim(instancia.isEnd);
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

  if (filmes.length === 0) return null;

  const rotulo = (primeiroMaior ? `fileira-${titulo}-destaque` : `fileira-${titulo}`).replaceAll(
    " ",
    "-",
  );

  return (
    <section aria-labelledby={rotulo}>
      <div className="page-gutter mb-2">
        <h2
          id={rotulo}
          className="font-display text-2xl leading-tight tracking-tight text-balance sm:text-3xl"
        >
          {titulo}
        </h2>
      </div>
      <div
        className="fileira-trilho relative"
        data-pode-voltar={noInicio ? undefined : ""}
        data-pode-avancar={noFim ? undefined : ""}
      >
        <Swiper
          wrapperTag="ul"
          slidesPerView="auto"
          slidesPerGroupAuto
          spaceBetween={8}
          breakpoints={{
            640: {
              spaceBetween: 12,
            },
          }}
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
          {filmes.map((filme, index) => (
            <SwiperSlide
              key={filme.id}
              tag="li"
              className={
                primeiroMaior && index === 0
                  ? "w-[14rem]! sm:w-[22rem]!"
                  : "w-[7.75rem]! sm:w-[11rem]!"
              }
            >
              <Poster filme={filme} grande={primeiroMaior && index === 0} />
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          type="button"
          disabled={noInicio}
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label={`Rolar ${titulo} para a esquerda`}
          className={`${seta} fileira-seta fileira-seta-esq`}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={noFim}
          onClick={() => swiperRef.current?.slideNext()}
          aria-label={`Rolar ${titulo} para a direita`}
          className={`${seta} fileira-seta fileira-seta-dir`}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
