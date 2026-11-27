import { executarBusca, executarBuscaPorGenero } from "./busca.mjs";
import { armazenamentoCacheRedis } from "@/lib/armazenamento-redis.mjs";
import { recuperarFilmesPorGeneroComCache } from "@/lib/cache-genero.mjs";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const armazenamentoGenero = armazenamentoCacheRedis(redis);

export type FichaBusca = {
  id: number;
  titulo: string;
  genero: string | null;
  duracao: string | null;
  banner: string | null;
};

export type ResultadoBusca = {
  estado: "vazio" | "nenhum" | "ok";
  filmes: FichaBusca[];
  total: number;
  pagina: number;
  paginas: number;
};

export type GeneroResumo = { id: number; nome: string };

export type ResultadoBuscaPorGenero = {
  estado: "ausente" | "nenhum" | "ok";
  filmes: FichaBusca[];
  total: number;
  pagina: number;
  paginas: number;
  generos?: GeneroResumo[];
  genero?: GeneroResumo;
};

function executarSql(sql: string, params: unknown[]) {
  return prisma.$queryRawUnsafe<Record<string, unknown>[]>(sql, ...params);
}

export function buscarFilmes(entrada: {
  texto: string;
  pagina: number;
  tamanho: number;
}): Promise<ResultadoBusca> {
  return executarBusca(executarSql, entrada) as Promise<ResultadoBusca>;
}

export async function buscarFilmesPorGenero(entrada: {
  generoId?: number;
  generoIds?: number[];
  pagina: number;
  tamanho: number;
}): Promise<ResultadoBuscaPorGenero> {
  // acerto (hit/miss) disponível em recuperarFilmesPorGeneroComCache para o harness de experimento.
  const { valor } = await recuperarFilmesPorGeneroComCache({
    ...entrada,
    carregar: () => executarBuscaPorGenero(executarSql, entrada),
    armazenamento: armazenamentoGenero,
  });
  return valor as ResultadoBuscaPorGenero;
}

export async function listarGeneros(): Promise<GeneroResumo[]> {
  const linhas = await prisma.genero.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
  return linhas.map((linha) => ({ id: linha.id, nome: linha.nome }));
}
