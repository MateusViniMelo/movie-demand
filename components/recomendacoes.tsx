"use client";

import { useEffect, useState } from "react";
import { Fileira } from "@/components/fileira";
import {
  eventoAtualizaRecomendacao,
  filmesDaResposta,
  lerArmazenamento,
  pedidoSeHouver,
} from "@/lib/recomendacoes.mjs";

export function Recomendacoes({ filmeId: origem }: { filmeId?: number }) {
  const [filmes, setFilmes] = useState<{ id: number; titulo: string; src: string }[]>([]);

  useEffect(() => {
    let ativo = true;
    let geracao = 0;
    const carregar = () => {
      const pedidoAtual = ++geracao;
      if (ativo) setFilmes([]);
      const filmeId = origem ?? lerArmazenamento(localStorage);
      const pedido = pedidoSeHouver(filmeId);
      if (pedido === null) return;
      fetch(pedido)
        .then(async (resposta) => {
          const corpo = resposta.ok ? await resposta.json() : null;
          return filmesDaResposta(resposta.status, corpo);
        })
        .then((lista) => {
          if (ativo && pedidoAtual === geracao) setFilmes(lista);
        })
        .catch(() => {
          if (ativo && pedidoAtual === geracao) setFilmes([]);
        });
    };
    carregar();
    const aoStorage = (evento: StorageEvent) => {
      if (eventoAtualizaRecomendacao(evento.key)) carregar();
    };
    if (origem === undefined) window.addEventListener("storage", aoStorage);
    return () => {
      ativo = false;
      window.removeEventListener("storage", aoStorage);
    };
  }, [origem]);

  if (filmes.length === 0) return null;
  return <Fileira titulo="Recomendações" filmes={filmes} />;
}
