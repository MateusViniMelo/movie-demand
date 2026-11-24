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

export function CarrosselElenco({
  pessoas,
}: {
  pessoas: { pessoaId: number; nome: string; personagem: string; foto: string | null }[];
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

  if (pessoas.length === 0) return null;

  return (
    <div
      className="fileira-trilho relative"
      data-pode-voltar={noInicio ? undefined : ""}
      data-pode-avancar={noFim ? undefined : ""}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Elenco"
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
        {pessoas.map((pessoa) => (
          <SwiperSlide key={pessoa.pessoaId} tag="li" className="w-[7.75rem]! sm:w-[9.5rem]!">
            <figure className="min-w-0">
              <div className="relative aspect-[2/3] overflow-hidden rounded-[4px] bg-[#1c1816]">
                {pessoa.foto ? (
                  <Image
                    src={pessoa.foto}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 124px, 152px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <figcaption className="mt-2 min-w-0">
                <p className="truncate text-sm font-medium text-stage-ink">{pessoa.nome}</p>
                {pessoa.personagem ? (
                  <p className="truncate text-xs text-stage-muted">{pessoa.personagem}</p>
                ) : null}
              </figcaption>
            </figure>
          </SwiperSlide>
        ))}
      </Swiper>
      <button
        type="button"
        disabled={noInicio}
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Pessoa anterior do elenco"
        className={`${seta} fileira-seta fileira-seta-esq`}
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <button
        type="button"
        disabled={noFim}
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Próxima pessoa do elenco"
        className={`${seta} fileira-seta fileira-seta-dir`}
      >
        <ChevronRight aria-hidden="true" />
      </button>
    </div>
  );
}
