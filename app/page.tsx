import type { Metadata } from "next";
import { Suspense } from "react";
import { Fileira } from "@/components/fileira";
import { Hero } from "@/components/hero";
import { Topo } from "@/components/topo";
import { carregarVitrine } from "@/lib/vitrine";
import { htmlDoJsonLd, jsonLdDoSite, metadadosDaHome, origemDoSite } from "@/lib/seo.mjs";

const origem = origemDoSite(process.env);
const home = metadadosDaHome(origem);

export const metadata: Metadata = {
  alternates: {
    canonical: home.alternates.canonical,
  },
};

export default function Catalogo() {
  return (
    <main className="min-h-dvh bg-stage text-stage-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: htmlDoJsonLd(jsonLdDoSite(origem)) }}
      />
      <Topo />
      <Suspense
        fallback={
          <>
            <h1 id="conteudo" tabIndex={-1} className="sr-only">
              Cineverso
            </h1>
            <p className="page-gutter min-h-[78vh] pt-28 text-base" role="status">
              Carregando o catálogo…
            </p>
          </>
        }
      >
        <Vitrine />
      </Suspense>
    </main>
  );
}

async function Vitrine() {
  const { destaque, fileiras, hero } = await carregarVitrine();
  if (destaque.length === 0 && fileiras.every((fileira) => fileira.filmes.length === 0)) {
    return (
      <>
        <h1 id="conteudo" tabIndex={-1} className="sr-only">
          Cineverso
        </h1>
        <p className="page-gutter min-h-[78vh] pt-28 text-base" role="status">
          Nenhuma ficha neste catálogo.
        </p>
      </>
    );
  }

  const listas = (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {fileiras.map((fileira) =>
        fileira.titulo === "Filmes Populares" ? null : (
          <Fileira key={fileira.titulo} titulo={fileira.titulo} filmes={fileira.filmes} />
        ),
      )}
    </div>
  );

  if (hero.length === 0) {
    return (
      <div className="space-y-8 pt-24 pb-[max(4rem,env(safe-area-inset-bottom))]">
        <h1 id="conteudo" tabIndex={-1} className="sr-only">
          Cineverso
        </h1>
        {listas}
      </div>
    );
  }

  return <Hero filmes={hero}>{listas}</Hero>;
}
