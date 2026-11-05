import { prisma } from "@/lib/prisma";
import { atenderRecomendacao, filmeDaLinha } from "@/lib/recomendacoes.mjs";

export function carregarRecomendacoes(consulta: string) {
  return atenderRecomendacao(consulta, async () => {
    const linhas = await prisma.filme.findMany({
      select: {
        id: true,
        titulo: true,
        posterPath: true,
        colecaoId: true,
        votos: true,
        notaMedia: true,
        generos: { select: { generoId: true } },
        elencos: { select: { pessoaId: true, ordem: true } },
      },
    });
    return linhas.map((linha) => filmeDaLinha(linha));
  });
}
