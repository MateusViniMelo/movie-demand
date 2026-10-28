"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Swiper as InstanciaSwiper } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Poster } from "@/components/poster";

const VELOCIDADE = 300;

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

  const rotulo = primeiroMaior ? `fileira-${titulo}-destaque` : `fileira-${titulo}`;

  return (
    <section aria-labelledby={rotulo}>
      <div className="mb-2 flex items-center justify-between gap-3 px-4 sm:px-12">
        <h2
          id={rotulo}
          className="font-display text-2xl leading-none tracking-tight sm:text-3xl"
        >
          {titulo}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label={`Rolar ${titulo} para a esquerda`}
            className="inline-flex size-11 items-center justify-center rounded-full bg-stage-elev text-stage-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            aria-label={`Rolar ${titulo} para a direita`}
            className="inline-flex size-11 items-center justify-center rounded-full bg-stage-elev text-stage-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <Swiper
        wrapperTag="ul"
        slidesPerView="auto"
        slidesPerGroupAuto
        spaceBetween={8}
        slidesOffsetBefore={16}
        slidesOffsetAfter={16}
        breakpoints={{
          640: {
            spaceBetween: 12,
            slidesOffsetBefore: 48,
            slidesOffsetAfter: 48,
          },
        }}
        speed={VELOCIDADE}
        lazyPreload={false}
        watchOverflow
        onSwiper={(instancia) => {
          swiperRef.current = instancia;
        }}
        className="pb-2"
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
    </section>
  );
}
