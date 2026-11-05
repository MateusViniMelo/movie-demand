import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Topo } from "@/components/topo";
import { Voltar } from "@/components/voltar";
import { carregarFilme } from "@/lib/filme-db";
import { fichaDoFilme, idDoFilme } from "@/lib/filme.mjs";

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
            <div className="page-gutter flex min-h-[78vh] flex-col pt-[max(8.75rem,calc(7.75rem+env(safe-area-inset-top,0px)))] sm:pt-28">
              <Voltar />
              <p className="text-base" role="status">
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

  return (
    <section aria-labelledby="conteudo" className="relative min-h-[78vh]">
      {ficha.fundo ? (
        <Image src={ficha.fundo} alt="" fill sizes="100vw" preload className="object-cover" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-stage to-transparent" />
      <div className="page-gutter relative z-10 flex min-h-[78vh] min-w-0 flex-col pt-[max(8.75rem,calc(7.75rem+env(safe-area-inset-top,0px)))] pb-28 sm:pt-28">
        <Voltar tom="still" />
        <div className="mt-auto min-w-0 max-w-xl">
          <h1
            id="conteudo"
            tabIndex={-1}
            className="min-w-0 scroll-mt-28 font-display text-5xl leading-[0.95] tracking-tight break-words text-balance text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-7xl"
          >
            {ficha.titulo}
          </h1>
        </div>
      </div>
    </section>
  );
}
