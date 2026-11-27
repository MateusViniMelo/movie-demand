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

export type ResultadoBuscaPorGenero = {
  estado: "ausente" | "nenhum" | "ok";
  filmes: FichaBusca[];
  total: number;
  pagina: number;
  paginas: number;
  genero?: { id: number; nome: string };
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
  generoId: number;
  pagina: number;
  tamanho: number;
}): Promise<ResultadoBuscaPorGenero> {
  return executarBuscaPorGenero(executarSql, entrada) as Promise<ResultadoBuscaPorGenero>;
}
