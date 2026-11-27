import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LinhaBusca } from "@/components/busca";
import { Paginas } from "@/components/paginas";
import { Topo } from "@/components/topo";
import { Voltar } from "@/components/voltar";
import { buscarFilmesPorGenero } from "@/lib/busca-db";
import { textoDe } from "@/lib/consulta.mjs";
import { metadadosDoGenero } from "@/lib/seo.mjs";

export async function generateMetadata(props: PageProps<"/genero/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  try {
    const resultado = await buscarFilmesPorGenero({
      generoId: Number(id),
      pagina: 1,
      tamanho: 1,
    });
    return metadadosDoGenero(resultado.genero?.nome);
  } catch {
    return metadadosDoGenero(undefined);
  }
}

export default function PaginaGenero(props: PageProps<"/genero/[id]">) {
  return (
    <main className="min-h-dvh bg-stage text-stage-ink">
      <Topo modo="pagina" />
      <div className="page-gutter mx-auto w-full max-w-6xl pt-28 pb-[max(4rem,env(safe-area-inset-bottom))]">
        <Voltar />
        <Suspense fallback={<p role="status">Buscando filmes…</p>}>
          <Resultado params={props.params} searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function Resultado({
  params,
  searchParams,
}: {
  params: PageProps<"/genero/[id]">["params"];
  searchParams: PageProps<"/genero/[id]">["searchParams"];
}) {
  const { id } = await params;
  const consulta = await searchParams;
  const paginaBruta = textoDe(consulta.pagina) || "1";

  let resultado;
  try {
    resultado = await buscarFilmesPorGenero({
      generoId: Number(id),
      pagina: Number(paginaBruta),
      tamanho: 10,
    });
  } catch {
    return (
      <div>
        <h1 id="conteudo" tabIndex={-1} className="font-display text-3xl tracking-wide">
          Gênero
        </h1>
        <p className="mt-8 text-lg" role="status">
          A busca por gênero falhou.
        </p>
      </div>
    );
  }

  if (String(resultado.pagina) !== paginaBruta) {
    redirect(`/genero/${id}?pagina=${resultado.pagina}`);
  }

  return (
    <div>
      <h1 id="conteudo" tabIndex={-1} className="font-display text-3xl tracking-wide sm:text-4xl">
        {resultado.genero ? resultado.genero.nome : "Gênero"}
      </h1>
      {resultado.estado === "ausente" ? (
        <p className="mt-8 text-lg" role="status">
          Gênero não encontrado.
        </p>
      ) : null}
      {resultado.estado === "nenhum" ? (
        <p className="mt-8 text-lg" role="status">
          Nenhum filme para este gênero.
        </p>
      ) : null}
      {resultado.estado === "ok" ? (
        <div className="mt-6">
          {resultado.filmes.map((filme) => (
            <LinhaBusca key={filme.id} filme={filme} faixa />
          ))}
          <Paginas
            pagina={resultado.pagina}
            paginas={resultado.paginas}
            hrefDe={(pagina) => `/genero/${id}?pagina=${pagina}`}
          />
        </div>
      ) : null}
    </div>
  );
}
