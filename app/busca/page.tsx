import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Busca, LinhaBusca } from "@/components/busca";
import { Topo } from "@/components/topo";
import { Voltar } from "@/components/voltar";
import { numerosDePagina } from "@/lib/busca.mjs";
import { buscarFilmes } from "@/lib/busca-db";
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

function textoDe(valor: string | string[] | undefined) {
  if (typeof valor === "string") return valor;
  if (Array.isArray(valor)) return valor[0] ?? "";
  return "";
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
          <Paginas q={q} pagina={resultado.pagina} paginas={resultado.paginas} />
        </div>
      ) : null}
    </div>
  );
}

function Paginas({ q, pagina, paginas }: { q: string; pagina: number; paginas: number }) {
  const numeros = numerosDePagina(pagina, paginas);
  const classeNumero =
    "inline-flex min-h-11 min-w-11 items-center justify-center font-display text-2xl tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

  return (
    <nav aria-label="Páginas" className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
      {pagina > 1 ? (
        <a
          href={`/busca?q=${encodeURIComponent(q)}&pagina=${pagina - 1}`}
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
              <a
                href={`/busca?q=${encodeURIComponent(q)}&pagina=${numero}`}
                className={`${classeNumero} text-brand`}
              >
                {numero}
              </a>
            </li>
          ),
        )}
      </ol>
      {pagina < paginas ? (
        <a
          href={`/busca?q=${encodeURIComponent(q)}&pagina=${pagina + 1}`}
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
