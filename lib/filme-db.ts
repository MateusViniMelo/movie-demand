import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const carregarFilme = cache(async (id: number) => {
  return prisma.filme.findUnique({
    where: { id },
    select: {
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
    },
  });
});
