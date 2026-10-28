-- DropTable
DROP TABLE "filmes";

-- DropEnum
DROP TYPE "Origem";

-- CreateTable
CREATE TABLE "generos" (
    "id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "generos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colecoes" (
    "id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "poster_path" TEXT,
    "backdrop_path" TEXT,

    CONSTRAINT "colecoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filmes" (
    "id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "titulo_original" TEXT NOT NULL,
    "sinopse" TEXT NOT NULL DEFAULT '',
    "tagline" TEXT,
    "data_lancamento" DATE NOT NULL,
    "duracao_min" INTEGER NOT NULL,
    "popularidade" DOUBLE PRECISION NOT NULL,
    "nota_media" DOUBLE PRECISION NOT NULL,
    "votos" INTEGER NOT NULL,
    "adulto" BOOLEAN NOT NULL,
    "video" BOOLEAN NOT NULL,
    "softcore" BOOLEAN NOT NULL,
    "idioma_original" TEXT NOT NULL,
    "imdb_id" TEXT,
    "homepage" TEXT,
    "poster_path" TEXT,
    "backdrop_path" TEXT,
    "orcamento" INTEGER NOT NULL,
    "receita" BIGINT NOT NULL,
    "status" TEXT NOT NULL,
    "paises_origem" JSONB NOT NULL,
    "empresas" JSONB NOT NULL,
    "paises_producao" JSONB NOT NULL,
    "idiomas" JSONB NOT NULL,
    "colecao_id" INTEGER,

    CONSTRAINT "filmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filme_generos" (
    "filme_id" INTEGER NOT NULL,
    "genero_id" INTEGER NOT NULL,

    CONSTRAINT "filme_generos_pkey" PRIMARY KEY ("filme_id","genero_id")
);

-- CreateTable
CREATE TABLE "pessoas" (
    "id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "nome_original" TEXT NOT NULL,
    "sexo" INTEGER NOT NULL,
    "departamento" TEXT NOT NULL,
    "popularidade" DOUBLE PRECISION NOT NULL,
    "adulto" BOOLEAN NOT NULL,
    "foto_path" TEXT,

    CONSTRAINT "pessoas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elenco" (
    "credit_id" TEXT NOT NULL,
    "filme_id" INTEGER NOT NULL,
    "pessoa_id" INTEGER NOT NULL,
    "personagem" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "cast_id" INTEGER NOT NULL,

    CONSTRAINT "elenco_pkey" PRIMARY KEY ("credit_id")
);

-- CreateTable
CREATE TABLE "listas" (
    "slug" TEXT NOT NULL,

    CONSTRAINT "listas_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "lista_filmes" (
    "lista_slug" TEXT NOT NULL,
    "filme_id" INTEGER NOT NULL,
    "posicao" INTEGER NOT NULL,

    CONSTRAINT "lista_filmes_pkey" PRIMARY KEY ("lista_slug","filme_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lista_filmes_lista_slug_posicao_key" ON "lista_filmes"("lista_slug", "posicao");

-- AddForeignKey
ALTER TABLE "filmes" ADD CONSTRAINT "filmes_colecao_id_fkey" FOREIGN KEY ("colecao_id") REFERENCES "colecoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filme_generos" ADD CONSTRAINT "filme_generos_filme_id_fkey" FOREIGN KEY ("filme_id") REFERENCES "filmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filme_generos" ADD CONSTRAINT "filme_generos_genero_id_fkey" FOREIGN KEY ("genero_id") REFERENCES "generos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elenco" ADD CONSTRAINT "elenco_filme_id_fkey" FOREIGN KEY ("filme_id") REFERENCES "filmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elenco" ADD CONSTRAINT "elenco_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "pessoas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lista_filmes" ADD CONSTRAINT "lista_filmes_lista_slug_fkey" FOREIGN KEY ("lista_slug") REFERENCES "listas"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lista_filmes" ADD CONSTRAINT "lista_filmes_filme_id_fkey" FOREIGN KEY ("filme_id") REFERENCES "filmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
