import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Busca, LinhaBusca } from "@/components/busca";
import { Topo } from "@/components/topo";
import { buscarFilmes } from "@/lib/busca-db";

export default function PaginaBusca(props: PageProps<"/busca">) {
  return (
    <main className="min-h-dvh bg-stage text-stage-ink">
      <Topo comBusca={false} />
      <Suspense
        fallback={
          <p className="page-gutter mx-auto w-full max-w-6xl pt-28" role="status">
            Buscando filmes…
          </p>
        }
      >
        <Resultado searchParams={props.searchParams} />
      </Suspense>
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
      <div className="page-gutter mx-auto w-full max-w-6xl pt-28">
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
    <div className="page-gutter mx-auto w-full max-w-6xl pt-28 pb-[max(4rem,env(safe-area-inset-bottom))]">
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
          <nav aria-label="Páginas" className="mt-10 flex flex-wrap items-baseline gap-x-8 gap-y-3">
            {resultado.pagina > 1 ? (
              <a
                href={`/busca?q=${encodeURIComponent(q)}&pagina=${resultado.pagina - 1}`}
                className="font-display text-2xl tracking-wide text-brand"
              >
                Página anterior
              </a>
            ) : (
              <span className="font-display text-2xl tracking-wide text-stage-muted">Página anterior</span>
            )}
            {resultado.pagina < resultado.paginas ? (
              <a
                href={`/busca?q=${encodeURIComponent(q)}&pagina=${resultado.pagina + 1}`}
                className="font-display text-2xl tracking-wide text-brand"
              >
                Próxima página
              </a>
            ) : (
              <span className="font-display text-2xl tracking-wide text-stage-muted">Próxima página</span>
            )}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
