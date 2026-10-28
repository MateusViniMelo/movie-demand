import { executarBusca } from "./busca.mjs";
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

export function buscarFilmes(entrada: {
  texto: string;
  pagina: number;
  tamanho: number;
}): Promise<ResultadoBusca> {
  return executarBusca(
    (sql: string, params: unknown[]) =>
      prisma.$queryRawUnsafe<Record<string, unknown>[]>(sql, ...params),
    entrada,
  ) as Promise<ResultadoBusca>;
}
