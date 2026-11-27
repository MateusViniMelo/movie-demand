import { numerosDePagina } from "@/lib/busca.mjs";

export function Paginas({
  pagina,
  paginas,
  hrefDe,
}: {
  pagina: number;
  paginas: number;
  hrefDe: (pagina: number) => string;
}) {
  const numeros = numerosDePagina(pagina, paginas);
  const classeNumero =
    "inline-flex min-h-11 min-w-11 items-center justify-center font-display text-2xl tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

  return (
    <nav aria-label="Páginas" className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
      {pagina > 1 ? (
        <a
          href={hrefDe(pagina - 1)}
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
              <a href={hrefDe(numero)} className={`${classeNumero} text-brand`}>
                {numero}
              </a>
            </li>
          ),
        )}
      </ol>
      {pagina < paginas ? (
        <a
          href={hrefDe(pagina + 1)}
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
