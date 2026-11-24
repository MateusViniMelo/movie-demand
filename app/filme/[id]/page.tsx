import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Play, Star } from "lucide-react";
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
            <div className="ficha-shell flex min-h-[78vh] flex-col pl-(--ficha-recuo) pr-(--ficha-recuo-dir) pt-[max(11rem,calc(10rem+env(safe-area-inset-top,0px)))] pb-16 sm:pt-48">
              <Voltar />
              <p className="mt-8 text-base text-stage-muted" role="status">
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
        <div className="ficha-still-banner relative h-[min(52vh,32rem)] w-full overflow-hidden">
          {ficha.fundo ? (
            <Image
              src={ficha.fundo}
              alt=""
              fill
              sizes="100vw"
              preload
              className="ficha-still-foto object-cover object-[center_18%] scale-[1.02]"
            />
          ) : null}
          <div className="ficha-still-scrim absolute inset-0" aria-hidden="true" />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/10"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0908] via-[#0a0908]/75 to-transparent"
            aria-hidden="true"
          />
        </div>

        <div className="ficha-shell relative z-10 -mt-[clamp(5rem,18vh,9rem)] flex min-w-0 flex-col pl-(--ficha-recuo) pr-(--ficha-recuo-dir) pb-[clamp(3rem,8vh,5rem)]">
          <div className="mx-auto w-full max-w-4xl sm:w-fit">
            <Voltar tom="still" />
            <div className="ficha-placa-linha mt-6 flex min-w-0 flex-col gap-6 sm:mt-8 sm:flex-row sm:items-start sm:gap-x-[clamp(1.25rem,3.5vw,2.75rem)]">
              {ficha.poster ? (
                <div className="ficha-placa relative mx-auto aspect-[2/3] w-[clamp(10.5rem,34vw,18rem)] shrink-0 overflow-hidden rounded-md bg-[#1c1816] shadow-[0_24px_60px_-18px_rgba(0,0,0,0.85)] ring-1 ring-white/15 sm:mx-0">
                  <Image
                    src={ficha.poster}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 168px, 288px"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="ficha-copy min-w-0 w-full max-w-xl pt-1 sm:w-[min(100%,36rem)] sm:pt-2">
                <h1
                  id="conteudo"
                  tabIndex={-1}
                  className="ficha-titulo min-w-0 scroll-mt-28 font-display text-4xl leading-[0.95] tracking-tight break-words text-balance text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-5xl md:text-6xl"
                >
                  {ficha.titulo}
                </h1>

                {ficha.nota ? (
                  <p className="ficha-nota mt-4 flex flex-wrap items-center gap-2 text-sm text-white/90">
                    <Star aria-hidden="true" className="size-4 fill-brand text-brand" strokeWidth={0} />
                    <span className="font-mono tabular-nums">{ficha.nota}</span>
                  </p>
                ) : null}

                {ficha.detalhe ? (
                  <p className="ficha-meta mt-3 font-mono text-sm tracking-wide text-white/80 tabular-nums">
                    {ficha.detalhe}
                  </p>
                ) : null}

                {ficha.generos.length > 0 ? (
                  <ul className="ficha-generos mt-4 flex flex-wrap gap-2" aria-label="Gêneros">
                    {ficha.generos.map((genero) => (
                      <li key={genero}>
                        <span className="inline-flex max-w-full items-center whitespace-nowrap rounded-full bg-brand px-3 py-1 text-xs font-medium text-white">
                          {genero}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <SinopseExpansivel
                  texto={ficha.sinopse}
                  id="ficha-sinopse"
                  className="text-white/90 max-w-xl"
                />

                {ficha.trailerEmbed ? (
                  <a
                    href="#trailer"
                    className="ficha-cta mt-5 inline-flex h-11 cursor-pointer touch-manipulation items-center gap-2 rounded-full bg-brand px-5 text-sm font-medium text-white motion-safe:transition-[transform,background-color] motion-safe:duration-200 motion-safe:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f40612] motion-safe:active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    <Play aria-hidden="true" className="size-4 fill-current" strokeWidth={0} />
                    Ver trailer
                  </a>
                ) : null}

                {ficha.elenco.length > 0 ? (
                  <section aria-labelledby="elenco" className="ficha-secao ficha-copy-secao mt-10">
                    <h2
                      id="elenco"
                      className="ficha-secao-titulo scroll-mt-28 font-display text-2xl leading-tight tracking-tight text-balance text-white sm:text-3xl"
                    >
                      Elenco
                    </h2>
                    <div className="mt-5">
                      <CarrosselElenco pessoas={ficha.elenco} />
                    </div>
                  </section>
                ) : null}

                {ficha.trailerEmbed ? (
                  <section aria-labelledby="trailer" className="ficha-secao ficha-copy-secao mt-10 pb-2">
                    <h2
                      id="trailer"
                      className="ficha-secao-titulo scroll-mt-28 font-display text-2xl leading-tight tracking-tight text-balance text-white sm:text-3xl"
                    >
                      Trailer
                    </h2>
                    <div className="ficha-trailer mt-5 aspect-video w-full overflow-hidden rounded-md bg-[#1c1816] ring-1 ring-white/10 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.55)]">
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
                      <p className="mt-3 text-sm text-white/70">
                        <a
                          href={ficha.trailerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-4 motion-safe:transition-colors motion-safe:duration-150 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                          Abrir no YouTube
                        </a>
                      </p>
                    ) : null}
                  </section>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stage to-transparent"
          aria-hidden="true"
        />
      </section>

      <div className="faixa-ficha relative z-10 mx-auto w-full max-w-4xl">
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
        <Recomendacoes filmeId={filmeId} />
      </div>
    </>
  );
}
