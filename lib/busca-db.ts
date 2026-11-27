import { executarBusca, executarBuscaPorGenero } from "./busca.mjs";
import { prisma } from "@/lib/prisma";

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

export function buscarFilmesPorGenero(entrada: {
  generoId?: number;
  generoIds?: number[];
  pagina: number;
  tamanho: number;
}): Promise<ResultadoBuscaPorGenero> {
  return executarBuscaPorGenero(executarSql, entrada) as Promise<ResultadoBuscaPorGenero>;
}

export async function listarGeneros(): Promise<GeneroResumo[]> {
  const linhas = await prisma.genero.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
  return linhas.map((linha) => ({ id: linha.id, nome: linha.nome }));
}
