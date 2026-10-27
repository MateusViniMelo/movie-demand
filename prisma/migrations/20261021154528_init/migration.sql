-- CreateEnum
CREATE TYPE "Origem" AS ENUM ('real', 'sintetica');

-- CreateTable
CREATE TABLE "filmes" (
    "id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "duracao_min" INTEGER NOT NULL,
    "url_midia" TEXT NOT NULL,
    "origem" "Origem" NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "filmes_pkey" PRIMARY KEY ("id")
);
