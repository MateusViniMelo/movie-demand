import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LinhaBusca } from "@/components/busca";
import { Topo } from "@/components/topo";
import { Voltar } from "@/components/voltar";
import { numerosDePagina } from "@/lib/busca.mjs";
import { buscarFilmesPorGenero } from "@/lib/busca-db";
import { metadadosDaGenero } from "@/lib/seo.mjs";

export async function generateMetadata(props: PageProps<"/genero/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  try {
    const resultado = await buscarFilmesPorGenero({
      generoId: Number(id),
      pagina: 1,
      tamanho: 10,
    });
    return metadadosDaGenero(resultado.genero?.nome);
  } catch {
    return metadadosDaGenero(undefined);
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

function textoDe(valor: string | string[] | undefined) {
  if (typeof valor === "string") return valor;
  if (Array.isArray(valor)) return valor[0] ?? "";
  return "";
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
          <Paginas id={id} pagina={resultado.pagina} paginas={resultado.paginas} />
        </div>
      ) : null}
    </div>
  );
}

function Paginas({ id, pagina, paginas }: { id: string; pagina: number; paginas: number }) {
  const numeros = numerosDePagina(pagina, paginas);
  const classeNumero =
    "inline-flex min-h-11 min-w-11 items-center justify-center font-display text-2xl tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

  return (
    <nav aria-label="Páginas" className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
      {pagina > 1 ? (
        <a
          href={`/genero/${id}?pagina=${pagina - 1}`}
          className="font-display text-2xl tracking-wide text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Página anterior
        </a>
      ) : (
        <span className="font-display text-2xl tracking-wide text-stage-muted">Página anterior</span>
      )}
      <ol className="flex flex-wrap items-center gap-1">
        {numeros.map((numero, indice) =>
          numero === "…" ? (
            <li key={`reticencias-${indice}`}>
              <span className="px-1 font-display text-2xl tracking-wide text-stage-muted" aria-hidden="true">
                …
              </span>
            </li>
          ) : numero === pagina ? (
            <li key={numero}>
              <span aria-current="page" className={`${classeNumero} border-b-2 border-brand text-stage-ink`}>
                {numero}
              </span>
            </li>
          ) : (
            <li key={numero}>
              <a href={`/genero/${id}?pagina=${numero}`} className={`${classeNumero} text-brand`}>
                {numero}
              </a>
            </li>
          ),
        )}
      </ol>
      {pagina < paginas ? (
        <a
          href={`/genero/${id}?pagina=${pagina + 1}`}
          className="font-display text-2xl tracking-wide text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Próxima página
        </a>
      ) : (
        <span className="font-display text-2xl tracking-wide text-stage-muted">Próxima página</span>
      )}
    </nav>
  );
}
