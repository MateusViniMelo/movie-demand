import { FILEIRAS, montarVitrine } from "./cartaz.mjs";
import { prisma } from "@/lib/prisma";

export async function carregarVitrine() {
  const linhas = await prisma.listaFilme.findMany({
    where: { listaSlug: { in: FILEIRAS.map((fileira) => fileira.slug) } },
    orderBy: { posicao: "asc" },
    select: {
      listaSlug: true,
      posicao: true,
      filme: { select: { id: true, titulo: true, posterPath: true } },
    },
  });

  return montarVitrine(
    linhas.map((linha) => ({
      slug: linha.listaSlug,
      posicao: linha.posicao,
      id: linha.filme.id,
      titulo: linha.filme.titulo,
      posterPath: linha.filme.posterPath,
    })),
  );
}
