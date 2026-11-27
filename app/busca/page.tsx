import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Busca, LinhaBusca } from "@/components/busca";
import { Paginas } from "@/components/paginas";
import { Topo } from "@/components/topo";
import { Voltar } from "@/components/voltar";
import { buscarFilmes } from "@/lib/busca-db";
import { textoDe } from "@/lib/consulta.mjs";
import { metadadosDaBusca } from "@/lib/seo.mjs";

export const metadata: Metadata = metadadosDaBusca();

export default function PaginaBusca(props: PageProps<"/busca">) {
  return (
    <main className="min-h-dvh bg-stage text-stage-ink">
      <Topo comBusca={false} modo="pagina" />
      <div className="page-gutter mx-auto w-full max-w-6xl pt-28 pb-[max(4rem,env(safe-area-inset-bottom))]">
        <Voltar />
        <Suspense fallback={<p role="status">Buscando filmes…</p>}>
          <Resultado searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function Resultado({
  searchParams,
}: {
  searchParams: PageProps<"/busca">["searchParams"];
}) {
  const params = await searchParams;
  const q = textoDe(params.q);
  const paginaBruta = textoDe(params.pagina) || "1";

  let resultado;
  try {
    resultado = await buscarFilmes({
      texto: q,
      pagina: Number(paginaBruta),
      tamanho: 10,
    });
  } catch {
    return (
      <div>
        <h1 id="conteudo" tabIndex={-1} className="sr-only">
          Busca
        </h1>
        <p role="status">A busca falhou.</p>
      </div>
    );
  }

  if (resultado.estado !== "vazio" && String(resultado.pagina) !== paginaBruta) {
    redirect(`/busca?q=${encodeURIComponent(q)}&pagina=${resultado.pagina}`);
  }

  return (
    <div>
      <h1 id="conteudo" tabIndex={-1} className="sr-only">
        Busca
      </h1>
      <Busca modo="pagina" textoInicial={q} />
      {resultado.estado === "vazio" ? (
        <p className="mt-8 text-lg" role="status">
          Digite um filme para buscar.
        </p>
      ) : null}
      {resultado.estado === "nenhum" ? (
        <p className="mt-8 text-lg" role="status">
          Nenhum filme para esta busca.
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
            hrefDe={(pagina) => `/busca?q=${encodeURIComponent(q)}&pagina=${pagina}`}
          />
        </div>
      ) : null}
    </div>
  );
}
