"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  if (imagens.length === 0) return null;

  return (
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
        {imagens.map((imagem) => (
          <SwiperSlide
            key={imagem.chave ?? imagem.src}
            tag="li"
            className={
              imagem.tipo === "poster" ? "w-[9.5rem]! sm:w-[12rem]!" : "w-[min(85vw,28rem)]!"
            }
          >
            <div
              className={
                imagem.tipo === "poster"
                  ? "relative aspect-[2/3] overflow-hidden rounded-[4px] bg-[#1c1816]"
                  : "relative aspect-video overflow-hidden rounded-[4px] bg-[#1c1816]"
              }
            >
              <Image
                src={imagem.src}
                alt={imagem.alt}
                fill
                sizes={
                  imagem.tipo === "poster"
                    ? "(max-width: 640px) 152px, 192px"
                    : "(max-width: 640px) 85vw, 448px"
                }
                className="object-cover"
              />
            </div>
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
    </div>
  );
}
