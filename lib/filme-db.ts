import { cache } from "react";
import { armazenamentoCacheRedis } from "@/lib/armazenamento-redis.mjs";
import { recuperarFilmeComCache } from "@/lib/cache-ficha.mjs";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const armazenamentoFicha = armazenamentoCacheRedis(redis);

const selectFilme = {
  id: true,
  titulo: true,
  posterPath: true,
  backdropPath: true,
  dataLancamento: true,
  duracaoMin: true,
  notaMedia: true,
  votos: true,
  sinopse: true,
  trailerUrl: true,
  generos: { select: { genero: { select: { nome: true } } } },
  elencos: {
    select: {
      personagem: true,
      ordem: true,
      pessoaId: true,
      pessoa: { select: { nome: true, fotoPath: true } },
    },
  },
} as const;

async function buscarFilmeNoPostgres(id: number) {
  return prisma.filme.findUnique({
    where: { id },
    select: selectFilme,
  });
}

export const carregarFilme = cache(async (id: number) => {
  return recuperarFilmeComCache(id, {
    carregar: () => buscarFilmeNoPostgres(id),
    armazenamento: armazenamentoFicha,
  });
});