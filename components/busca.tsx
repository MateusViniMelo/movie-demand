"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FichaBusca } from "@/lib/busca-db";

const ESPERA = 200;

export function LinhaBusca({ filme, faixa = false }: { filme: FichaBusca; faixa?: boolean }) {
  const meta = [filme.genero, filme.duracao].filter(Boolean).join(" · ");
  return (
    <article
      className={
        filme.banner
          ? `grid items-center gap-x-4 border-t border-stage-ink/12 py-3 ${
              faixa
                ? "grid-cols-[8.5rem_minmax(0,1fr)] sm:grid-cols-[14rem_minmax(0,1fr)]"
                : "grid-cols-[6.75rem_minmax(0,1fr)]"
            }`
          : "border-t border-stage-ink/12 py-3"
      }
    >
      {filme.banner ? (
        <div className={`relative overflow-hidden bg-stage-elev ${faixa ? "aspect-video" : "aspect-[16/10]"}`}>
          <Image
            src={filme.banner}
            alt=""
            fill
            sizes={faixa ? "(max-width: 640px) 136px, 224px" : "108px"}
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="min-w-0">
        <h2
          className={`font-display leading-none tracking-wide ${
            faixa ? "text-[clamp(1.7rem,4vw,2.4rem)]" : "text-xl"
          }`}
        >
          {filme.titulo}
        </h2>
        {meta ? <p className="mt-1 text-sm text-stage-muted">{meta}</p> : null}
      </div>
    </article>
  );
}

export function Busca({
  textoInicial = "",
  modo = "painel",
}: {
  textoInicial?: string;
  modo?: "painel" | "pagina";
}) {
  const router = useRouter();
  const [texto, setTexto] = useState(textoInicial);
  const [resposta, setResposta] = useState<{
    q: string;
    estado: "nenhum" | "ok" | "erro";
    filmes: FichaBusca[];
  } | null>(null);
  const destino = `/busca?q=${encodeURIComponent(texto.trim())}&pagina=1`;
  const vigente = resposta?.q === texto ? resposta : null;

  useEffect(() => {
    if (modo !== "painel") return;
    if (!texto.trim()) return;
    const controle = new AbortController();
    const pedido = texto;
    const timer = window.setTimeout(() => {
      const parametros = new URLSearchParams({
        q: pedido,
        pagina: "1",
        tamanho: "5",
      });
      fetch(`/api/busca?${parametros}`, { signal: controle.signal })
        .then(async (respostaHttp) => {
          if (!respostaHttp.ok) {
            setResposta({ q: pedido, estado: "erro", filmes: [] });
            return;
          }
          const corpo = (await respostaHttp.json()) as {
            estado?: string;
            filmes?: FichaBusca[];
          };
          if (corpo.estado === "ok") {
            setResposta({
              q: pedido,
              estado: "ok",
              filmes: (corpo.filmes ?? []).slice(0, 5),
            });
            return;
          }
          if (corpo.estado === "nenhum") {
            setResposta({ q: pedido, estado: "nenhum", filmes: [] });
            return;
          }
          setResposta(null);
        })
        .catch((erro: unknown) => {
          if (erro instanceof DOMException && erro.name === "AbortError") return;
          setResposta({ q: pedido, estado: "erro", filmes: [] });
        });
    }, ESPERA);
    return () => {
      window.clearTimeout(timer);
      controle.abort();
    };
  }, [texto, modo]);

  useEffect(() => {
    if (modo !== "pagina") return;
    const consulta = texto.trim();
    const params = new URLSearchParams(window.location.search);
    const qAtual = (params.get("q") ?? "").trim();
    if (consulta === qAtual) return;
    const proximo = consulta ? `/busca?q=${encodeURIComponent(consulta)}&pagina=1` : "/busca";
    const timer = window.setTimeout(() => {
      router.replace(proximo, { scroll: false });
    }, ESPERA);
    return () => window.clearTimeout(timer);
  }, [texto, modo, router]);

  const painelAberto = modo === "painel" && texto.trim().length > 0 && vigente !== null;

  return (
    <form
      action="/busca"
      method="get"
      role="search"
      className="relative min-w-0"
      onSubmit={(event) => {
        if (!texto.trim()) event.preventDefault();
      }}
    >
      <div className="relative min-w-0">
        <label className="block min-w-0">
          <span className="sr-only">Buscar filme</span>
          <input
            type="search"
            name="q"
            value={texto}
            placeholder="Título ou sinopse"
            autoComplete="off"
            enterKeyHint="search"
            onChange={(event) => setTexto(event.target.value)}
            className={
              modo === "pagina"
                ? "h-14 w-full border-b border-stage-ink/30 bg-transparent font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-none tracking-wide text-stage-ink outline-none placeholder:text-stage-muted focus-visible:border-brand"
                : "h-11 w-full border-b border-current/40 bg-transparent pr-11 text-base outline-none placeholder:text-current/55 focus-visible:border-brand [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            }
          />
        </label>
        {modo === "painel" ? (
          <a
            href={texto.trim() ? destino : "/busca"}
            aria-label="Busca completa"
            className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-current/80 hover:text-brand focus-visible:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-safe:transition-colors motion-safe:duration-150"
          >
            <Search aria-hidden="true" strokeWidth={1.75} className="size-5" />
          </a>
        ) : null}
      </div>
      <input type="hidden" name="pagina" value="1" />
      {painelAberto ? (
        <div
          id="busca-painel"
          className="absolute top-[calc(100%+0.35rem)] right-0 left-0 z-40 bg-stage px-3 pt-1 pb-3 text-stage-ink motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-200 motion-safe:[animation-timing-function:cubic-bezier(0.16,1,0.3,1)]"
        >
          {vigente?.estado === "ok" ? (
            <div>
              {vigente.filmes.map((filme) => (
                <LinhaBusca key={filme.id} filme={filme} />
              ))}
            </div>
          ) : null}
          {vigente?.estado === "nenhum" ? (
            <p className="border-t border-stage-ink/12 py-3 text-sm" role="status">
              Nenhum filme para esta busca.
            </p>
          ) : null}
          {vigente?.estado === "erro" ? (
            <p className="border-t border-stage-ink/12 py-3 text-sm" role="status">
              A busca falhou.
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-3 inline-flex h-11 cursor-pointer items-center rounded-full bg-brand px-5 font-display text-lg tracking-wide text-white hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-safe:transition-transform motion-safe:duration-150 motion-safe:active:scale-95"
          >
            Busca completa
          </button>
        </div>
      ) : null}
    </form>
  );
}
