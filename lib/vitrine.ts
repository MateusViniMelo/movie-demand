import { FILEIRAS, montarVitrine } from "./cartaz.mjs";
import { recuperarVitrine } from "./cache-vitrine.mjs";
import { armazenamentoCacheRedis } from "./armazenamento-redis.mjs";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export { TTL_VITRINE_SEGUNDOS } from "./cache-vitrine.mjs";

async function carregarVitrineDoPostgres() {
  const linhas = await prisma.listaFilme.findMany({
    where: { listaSlug: { in: FILEIRAS.map((fileira) => fileira.slug) } },
    orderBy: { posicao: "asc" },
    select: {
      listaSlug: true,
      posicao: true,
      filme: {
        select: {
          id: true,
          titulo: true,
          sinopse: true,
          duracaoMin: true,
          posterPath: true,
          backdropPath: true,
          generos: { select: { genero: { select: { nome: true } } } },
        },
      },
    },
  });

  return montarVitrine(
    linhas.map((linha) => ({
      slug: linha.listaSlug,
      posicao: linha.posicao,
      id: linha.filme.id,
      titulo: linha.filme.titulo,
      sinopse: linha.filme.sinopse,
      duracaoMin: linha.filme.duracaoMin,
      posterPath: linha.filme.posterPath,
      backdropPath: linha.filme.backdropPath,
      generos: linha.filme.generos.map((item) => item.genero.nome),
    })),
  );
}

const armazenamentoVitrine = armazenamentoCacheRedis(redis);

type VitrineMontada = Awaited<ReturnType<typeof carregarVitrineDoPostgres>>;

export async function carregarVitrine(): Promise<VitrineMontada> {
  const vitrine = await recuperarVitrine({
    carregar: carregarVitrineDoPostgres,
    armazenamento: armazenamentoVitrine,
  });
  return vitrine as VitrineMontada;
}