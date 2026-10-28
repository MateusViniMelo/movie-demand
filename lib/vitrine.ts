import { FILEIRAS, montarVitrine } from "./cartaz.mjs";
import { prisma } from "@/lib/prisma";

export async function carregarVitrine() {
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
