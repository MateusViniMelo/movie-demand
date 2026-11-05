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
    },
  });
});
