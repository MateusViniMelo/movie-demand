import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LinhaBusca } from "@/components/busca";
import { Paginas } from "@/components/paginas";
import { Topo } from "@/components/topo";
import { Voltar } from "@/components/voltar";
import {
  caminhoDaBuscaPorGenero,
  idsDeGenero,
  tituloDosGeneros,
} from "@/lib/busca.mjs";
import { buscarFilmesPorGenero } from "@/lib/busca-db";
import { textoDe } from "@/lib/consulta.mjs";
import { metadadosDoGenero } from "@/lib/seo.mjs";

function idsDaQuery(valor: string | string[] | undefined) {
  if (valor === undefined) return [];
  const lista = Array.isArray(valor) ? valor : [valor];
  return idsDeGenero({ generoIds: lista.flatMap((item) => String(item).split(",")) });
}

export async function generateMetadata(props: PageProps<"/genero">): Promise<Metadata> {
  const consulta = await props.searchParams;
  const generoIds = idsDaQuery(consulta.g);
  if (generoIds.length === 0) return metadadosDoGenero(undefined);
  try {
    const resultado = await buscarFilmesPorGenero({
      generoIds,
      pagina: 1,
      tamanho: 1,
    });
    return metadadosDoGenero(tituloDosGeneros(resultado.generos));
  } catch {
    return metadadosDoGenero(undefined);
  }
}

export default function PaginaGenero(props: PageProps<"/genero">) {
  return (
    <main className="min-h-dvh bg-stage text-stage-ink">
      <Suspense fallback={<Topo modo="pagina" />}>
        <TopoComSelecao searchParams={props.searchParams} />
      </Suspense>
      <div className="page-gutter mx-auto w-full max-w-6xl pt-28 pb-[max(4rem,env(safe-area-inset-bottom))]">
        <Voltar />
        <Suspense fallback={<p role="status">Buscando filmes…</p>}>
          <Resultado searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function TopoComSelecao({
  searchParams,
}: {
  searchParams: PageProps<"/genero">["searchParams"];
}) {
  const consulta = await searchParams;
  return <Topo modo="pagina" generosSelecionados={idsDaQuery(consulta.g)} />;
}

async function Resultado({
  searchParams,
}: {
  searchParams: PageProps<"/genero">["searchParams"];
}) {
  const consulta = await searchParams;
  const generoIds = idsDaQuery(consulta.g);
  const paginaBruta = textoDe(consulta.pagina) || "1";

  if (generoIds.length === 0) {
    return (
      <div>
        <h1 id="conteudo" tabIndex={-1} className="font-display text-3xl tracking-wide">
          Gêneros
        </h1>
        <p className="mt-8 text-lg" role="status">
          Escolha um ou mais gêneros no topo.
        </p>
      </div>
    );
  }

  let resultado;
  try {
    resultado = await buscarFilmesPorGenero({
      generoIds,
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
    redirect(caminhoDaBuscaPorGenero(generoIds, resultado.pagina));
  }

  const titulo = tituloDosGeneros(resultado.generos) || "Gênero";

  return (
    <div>
      <h1 id="conteudo" tabIndex={-1} className="font-display text-3xl tracking-wide sm:text-4xl">
        {titulo}
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
            hrefDe={(pagina) => caminhoDaBuscaPorGenero(generoIds, pagina)}
          />
        </div>
      ) : null}
    </div>
  );
}
