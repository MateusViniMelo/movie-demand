import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Recomendacoes } from "@/components/recomendacoes";
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
            <div className="flex min-h-[78vh] flex-col pl-(--ficha-recuo) pr-(--ficha-recuo-dir) pt-[max(11rem,calc(10rem+env(safe-area-inset-top,0px)))] pb-[clamp(4.5rem,16vh,9rem)] sm:pt-48">
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
    <>
      <section aria-labelledby="conteudo" className="relative min-h-[78vh] bg-[#14110f]">
        {ficha.fundo ? (
          <Image src={ficha.fundo} alt="" fill sizes="100vw" preload className="object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-stage to-transparent" />
        <div className="relative z-10 flex min-h-[78vh] min-w-0 flex-col pl-(--ficha-recuo) pr-(--ficha-recuo-dir) pt-[max(11rem,calc(10rem+env(safe-area-inset-top,0px)))] pb-[clamp(4.5rem,16vh,9rem)] sm:pt-48">
          <Voltar tom="still" />
          <div className="mt-auto flex min-w-0 items-end gap-x-[clamp(0.9rem,2.8vw,2.75rem)]">
            {ficha.poster ? (
              <div className="ficha-placa relative aspect-[2/3] w-[clamp(6.5rem,12vw,11rem)] shrink-0 overflow-hidden rounded-[4px] bg-[#1c1816]">
                <Image src={ficha.poster} alt="" fill sizes="(max-width: 640px) 104px, 176px" className="object-cover" />
              </div>
            ) : null}
            <h1
              id="conteudo"
              tabIndex={-1}
              className="ficha-titulo min-w-0 max-w-xl scroll-mt-28 font-display text-5xl leading-[0.95] tracking-tight break-words text-balance text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-7xl"
            >
              {ficha.titulo}
            </h1>
          </div>
        </div>
      </section>
      <div className="faixa-ficha relative z-10">
        <Recomendacoes filmeId={filmeId} />
      </div>
    </>
  );
}
