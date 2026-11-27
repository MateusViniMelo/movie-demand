"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { caminhoDaBuscaPorGenero } from "@/lib/busca.mjs";

type GeneroOpcao = { id: number; nome: string };

export function SeletorGeneros({
  selecionados = [],
  solido = true,
}: {
  selecionados?: number[];
  solido?: boolean;
}) {
  const router = useRouter();
  const rotuloId = useId();
  const painelId = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const [aberto, setAberto] = useState(false);
  const [opcoes, setOpcoes] = useState<GeneroOpcao[]>([]);
  const [marcados, setMarcados] = useState<number[]>(selecionados);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    setMarcados(selecionados);
  }, [selecionados]);

  useEffect(() => {
    if (!aberto || opcoes.length > 0 || carregando) return;
    setCarregando(true);
    fetch("/api/generos")
      .then(async (resposta) => {
        if (!resposta.ok) throw new Error("falha");
        const corpo = (await resposta.json()) as { generos?: GeneroOpcao[] };
        setOpcoes(Array.isArray(corpo.generos) ? corpo.generos : []);
      })
      .catch(() => setOpcoes([]))
      .finally(() => setCarregando(false));
  }, [aberto, opcoes.length, carregando]);

  useEffect(() => {
    if (!aberto) return;
    const fechar = (evento: MouseEvent) => {
      if (!raiz.current?.contains(evento.target as Node)) setAberto(false);
    };
    const tecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", fechar);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fechar);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  function alternar(id: number) {
    setMarcados((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id].sort((a, b) => a - b),
    );
  }

  function aplicar() {
    if (marcados.length === 0) return;
    setAberto(false);
    router.push(caminhoDaBuscaPorGenero(marcados, 1));
  }

  const resumo =
    marcados.length === 0
      ? "Gêneros"
      : marcados.length === 1
        ? (opcoes.find((item) => item.id === marcados[0])?.nome ?? "1 gênero")
        : `${marcados.length} gêneros`;

  const botao =
    solido
      ? "bg-stage-elev text-stage-ink hover:bg-stage-ink/10"
      : "bg-black/70 text-white hover:bg-black/85";

  return (
    <div ref={raiz} className="relative min-w-0">
      <button
        type="button"
        id={rotuloId}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={painelId}
        onClick={() => setAberto((valor) => !valor)}
        className={`inline-flex h-11 max-w-full items-center gap-2 rounded-full px-3 text-sm font-medium motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${botao}`}
      >
        <span className="truncate">{resumo}</span>
        <ChevronDown aria-hidden="true" className="size-4 shrink-0 opacity-80" />
      </button>
      {aberto ? (
        <div
          id={painelId}
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={rotuloId}
          className="absolute top-[calc(100%+0.5rem)] right-0 z-40 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-stage-ink/15 bg-stage-elev p-3 text-stage-ink shadow-lg"
        >
          {carregando ? (
            <p className="text-sm text-stage-muted" role="status">
              Carregando gêneros…
            </p>
          ) : null}
          {!carregando && opcoes.length === 0 ? (
            <p className="text-sm text-stage-muted" role="status">
              Nenhum gênero disponível.
            </p>
          ) : null}
          {!carregando && opcoes.length > 0 ? (
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {opcoes.map((genero) => {
                const marcado = marcados.includes(genero.id);
                return (
                  <li key={genero.id}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-stage-ink/8">
                      <input
                        type="checkbox"
                        role="option"
                        aria-selected={marcado}
                        checked={marcado}
                        onChange={() => alternar(genero.id)}
                        className="size-4 accent-brand"
                      />
                      <span className="min-w-0 truncate">{genero.nome}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <div className="mt-3 flex justify-end gap-2 border-t border-stage-ink/10 pt-3">
            <button
              type="button"
              onClick={() => setMarcados([])}
              className="rounded-md px-3 py-1.5 text-sm text-stage-muted hover:text-stage-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Limpar
            </button>
            <button
              type="button"
              disabled={marcados.length === 0}
              onClick={aplicar}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Ver filmes
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
