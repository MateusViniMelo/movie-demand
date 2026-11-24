import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Play } from "lucide-react";
import { CarrosselElenco } from "@/components/carrossel-elenco";
import { CarrosselImagens } from "@/components/carrossel-imagens";
import { Recomendacoes } from "@/components/recomendacoes";
import { SinopseExpansivel } from "@/components/sinopse-expansivel";
import { Topo } from "@/components/topo";
import { Voltar } from "@/components/voltar";
import { carregarFilme } from "@/lib/filme-db";
import { fichaDoFilme, idDoFilme } from "@/lib/filme.mjs";
import { carregarImagensTmdb } from "@/lib/tmdb-imagens.mjs";

export async function generateMetadata(props: PageProps<"/filme/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const filmeId = idDoFilme(id);
  if (filmeId === null) notFound();
  const linha = await carregarFilme(filmeId);
  if (!linha) notFound();
  const ficha = fichaDoFilme(linha);
  return { title: ficha.titulo };
}

export default function PaginaFilme(props: PageProps<"/filme/[id]">) {
  return (
    <main className="min-h-dvh bg-stage text-stage-ink">
      <Topo />
      <Suspense
        fallback={
          <>
            <h1 id="conteudo" tabIndex={-1} className="sr-only">
              Filme
            </h1>
            <div className="ficha-shell flex min-h-[78vh] flex-col justify-end pl-(--ficha-recuo) pr-(--ficha-recuo-dir) pt-[max(11rem,calc(10rem+env(safe-area-inset-top,0px)))] pb-[clamp(4.5rem,16vh,9rem)] sm:pt-48">
              <Voltar />
              <p className="text-base text-stage-muted" role="status">
                Carregando o filme…
              </p>
            </div>
          </>
        }
      >
        <Ficha params={props.params} />
      </Suspense>
    </main>
  );
}

async function Ficha({ params }: { params: PageProps<"/filme/[id]">["params"] }) {
  const { id } = await params;
  const filmeId = idDoFilme(id);
  if (filmeId === null) notFound();
  const linha = await carregarFilme(filmeId);
  if (!linha) notFound();
  const ficha = fichaDoFilme(linha);
  const imagensTmdb = await carregarImagensTmdb(filmeId, ficha.titulo);
  const imagens = imagensTmdb.length > 0 ? imagensTmdb : ficha.imagens;

  return (
    <>
      <section aria-labelledby="conteudo" className="ficha-still relative min-h-[78vh] overflow-hidden bg-[#0a0908]">
        {ficha.fundo ? (
          <Image
            src={ficha.fundo}
            alt=""
            fill
            sizes="100vw"
            preload
            className="ficha-still-foto object-cover object-[center_20%] scale-[1.02]"
          />
        ) : null}
        <div className="ficha-still-scrim absolute inset-0" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/15"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-stage via-stage/80 to-transparent"
          aria-hidden="true"
        />
        <div className="ficha-shell relative z-10 flex min-h-[78vh] min-w-0 flex-col pl-(--ficha-recuo) pr-(--ficha-recuo-dir) pt-[max(11rem,calc(10rem+env(safe-area-inset-top,0px)))] pb-[clamp(4.5rem,16vh,9rem)] sm:pt-48">
          <Voltar tom="still" />
          <div className="mt-auto flex min-w-0 items-end gap-x-[clamp(1rem,3vw,2.75rem)]">
            {ficha.poster ? (
              <div className="ficha-placa relative aspect-[2/3] w-[clamp(7rem,14vw,12.5rem)] shrink-0 overflow-hidden rounded-sm bg-[#1c1816] shadow-[0_18px_48px_-12px_rgba(0,0,0,0.75)] ring-1 ring-white/15">
                <Image
                  src={ficha.poster}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 112px, 200px"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="ficha-copy min-w-0 max-w-2xl">
              <h1
                id="conteudo"
                tabIndex={-1}
                className="ficha-titulo min-w-0 scroll-mt-28 font-display text-5xl leading-[0.95] tracking-tight break-words text-balance text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-7xl"
              >
                {ficha.titulo}
              </h1>
              {ficha.meta ? (
                <p className="ficha-meta mt-4 max-w-xl font-mono text-sm tracking-wide text-white/80 tabular-nums">
                  {ficha.meta}
                </p>
              ) : null}
              <SinopseExpansivel texto={ficha.sinopse} id="ficha-sinopse" />
              {ficha.trailerEmbed ? (
                <a
                  href="#trailer"
                  className="ficha-cta mt-5 inline-flex h-11 cursor-pointer touch-manipulation items-center gap-2 rounded-full bg-brand px-5 text-sm font-medium text-white motion-safe:transition-[transform,background-color] motion-safe:duration-200 motion-safe:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f40612] motion-safe:active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <Play aria-hidden="true" className="size-4 fill-current" strokeWidth={0} />
                  Ver trailer
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <div className="faixa-ficha relative z-10">
        {ficha.trailerEmbed ? (
          <section aria-labelledby="trailer" className="ficha-secao page-gutter pb-10">
            <h2
              id="trailer"
              className="ficha-secao-titulo scroll-mt-28 font-display text-2xl leading-tight tracking-tight text-balance sm:text-3xl"
            >
              Trailer
            </h2>
            <div className="ficha-trailer mt-5 aspect-video max-w-4xl overflow-hidden rounded-sm bg-[#1c1816] ring-1 ring-black/10 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.55)] dark:ring-white/10">
              <iframe
                src={ficha.trailerEmbed}
                title={`Trailer de ${ficha.titulo}`}
                className="size-full border-0"
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            {ficha.trailerUrl ? (
              <p className="mt-3 text-sm text-stage-muted">
                <a
                  href={ficha.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 motion-safe:transition-colors motion-safe:duration-150 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stage-ink"
                >
                  Abrir no YouTube
                </a>
              </p>
            ) : null}
          </section>
        ) : null}
        {imagens.length > 0 ? (
          <section aria-labelledby="imagens" className="ficha-secao pb-10">
            <div className="page-gutter">
              <h2
                id="imagens"
                className="ficha-secao-titulo scroll-mt-28 font-display text-2xl leading-tight tracking-tight text-balance sm:text-3xl"
              >
                Imagens
              </h2>
            </div>
            <div className="mt-5">
              <CarrosselImagens imagens={imagens} />
            </div>
          </section>
        ) : null}
        {ficha.elenco.length > 0 ? (
          <section aria-labelledby="elenco" className="ficha-secao pb-10">
            <div className="page-gutter">
              <h2
                id="elenco"
                className="ficha-secao-titulo scroll-mt-28 font-display text-2xl leading-tight tracking-tight text-balance sm:text-3xl"
              >
                Elenco
              </h2>
            </div>
            <div className="mt-5">
              <CarrosselElenco pessoas={ficha.elenco} />
            </div>
          </section>
        ) : null}
        <Recomendacoes filmeId={filmeId} />
      </div>
    </>
  );
}
