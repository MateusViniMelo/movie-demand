import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
const config = readFileSync(new URL("../prisma.config.ts", import.meta.url), "utf8");
const ignore = readFileSync(new URL("../.gitignore", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

test("DB-09 gera o client em generated/prisma com prisma-client", () => {
  const generator = schema.match(/generator client \{[^}]*\}/s)?.[0] ?? "";
  assert.match(generator, /provider\s*=\s*"prisma-client"/);
  assert.match(generator, /output\s*=\s*"\.\.\/generated\/prisma"/);
  assert.match(ignore, /^\/generated\/prisma\/$/m);
});

test("DB-10 o datasource é postgresql e não guarda a URL", () => {
  const datasource = schema.match(/datasource db \{[^}]*\}/s)?.[0] ?? "";
  assert.match(datasource, /provider\s*=\s*"postgresql"/);
  assert.equal(datasource.includes("url"), false);
});

test("DB-11 prisma.config.ts lê DATABASE_URL com dotenv", () => {
  assert.match(config, /import "dotenv\/config"/);
  assert.match(config, /datasource:\s*\{[^}]*url:\s*env\("DATABASE_URL"\)/s);
});

function model(name) {
  return schema.match(new RegExp(`model ${name} \\{[^}]*\\}`, "s"))?.[0] ?? "";
}

test("CAT-01 o schema omite o enum Origem", () => {
  assert.equal(/enum\s+Origem\b/.test(schema), false);
});

test("CAT-02 o model Filme mapeia as colunas do TMDB", () => {
  const filme = model("Filme");
  assert.match(filme, /@@map\("filmes"\)/);
  assert.match(filme, /id\s+Int(?!\?)\s+@id\b/);
  assert.equal(filme.includes("autoincrement"), false);
  assert.match(filme, /titulo\s+String(?!\?)/);
  assert.match(filme, /tituloOriginal\s+String(?!\?)\s+@map\("titulo_original"\)/);
  assert.match(filme, /sinopse\s+String(?!\?)\s+@default\(""\)/);
  assert.match(filme, /tagline\s+String\?/);
  assert.match(filme, /dataLancamento\s+DateTime(?!\?)\s+@map\("data_lancamento"\)\s+@db\.Date/);
  assert.match(filme, /duracaoMin\s+Int(?!\?)\s+@map\("duracao_min"\)/);
  assert.match(filme, /popularidade\s+Float(?!\?)/);
  assert.match(filme, /notaMedia\s+Float(?!\?)\s+@map\("nota_media"\)/);
  assert.match(filme, /votos\s+Int(?!\?)/);
  assert.match(filme, /adulto\s+Boolean(?!\?)/);
  assert.match(filme, /video\s+Boolean(?!\?)/);
  assert.match(filme, /softcore\s+Boolean(?!\?)/);
  assert.match(filme, /idiomaOriginal\s+String(?!\?)\s+@map\("idioma_original"\)/);
  assert.match(filme, /imdbId\s+String\?\s+@map\("imdb_id"\)/);
  assert.match(filme, /homepage\s+String\?/);
  assert.match(filme, /posterPath\s+String\?\s+@map\("poster_path"\)/);
  assert.match(filme, /backdropPath\s+String\?\s+@map\("backdrop_path"\)/);
  assert.match(filme, /orcamento\s+Int(?!\?)/);
  assert.match(filme, /receita\s+BigInt(?!\?)/);
  assert.match(filme, /status\s+String(?!\?)/);
  assert.match(filme, /paisesOrigem\s+Json(?!\?)\s+@map\("paises_origem"\)/);
  assert.match(filme, /empresas\s+Json(?!\?)/);
  assert.match(filme, /paisesProducao\s+Json(?!\?)\s+@map\("paises_producao"\)/);
  assert.match(filme, /idiomas\s+Json(?!\?)/);
  assert.match(filme, /colecaoId\s+Int\?\s+@map\("colecao_id"\)/);
});

test("TRL-01 o model Filme mapeia trailerUrl", () => {
  const filme = model("Filme");
  assert.match(filme, /trailerUrl\s+String\?\s+@map\("trailer_url"\)/);
});

test("CAT-03 o model Filme omite as colunas do experimento", () => {
  const filme = model("Filme");
  assert.equal(/\bdescricao\b/.test(filme), false);
  assert.equal(filme.includes("urlMidia"), false);
  assert.equal(/\borigem\b/.test(filme), false);
  assert.equal(/\btags\b/.test(filme), false);
  assert.equal(/genero\s+String/.test(filme), false);
});

test("CAT-04 o model Genero mapeia generos", () => {
  const genero = model("Genero");
  assert.match(genero, /@@map\("generos"\)/);
  assert.match(genero, /id\s+Int(?!\?)\s+@id\b/);
  assert.match(genero, /nome\s+String(?!\?)/);
});

test("CAT-05 o model Colecao mapeia colecoes", () => {
  const colecao = model("Colecao");
  assert.match(colecao, /@@map\("colecoes"\)/);
  assert.match(colecao, /id\s+Int(?!\?)\s+@id\b/);
  assert.match(colecao, /nome\s+String(?!\?)/);
  assert.match(colecao, /posterPath\s+String\?\s+@map\("poster_path"\)/);
  assert.match(colecao, /backdropPath\s+String\?\s+@map\("backdrop_path"\)/);
});

test("CAT-06 o model FilmeGenero tem chave composta", () => {
  const vinculo = model("FilmeGenero");
  assert.match(vinculo, /@@map\("filme_generos"\)/);
  assert.match(vinculo, /@@id\(\[filmeId, generoId\]\)/);
});

test("CAT-07 o model Pessoa mapeia pessoas", () => {
  const pessoa = model("Pessoa");
  assert.match(pessoa, /@@map\("pessoas"\)/);
  assert.match(pessoa, /id\s+Int(?!\?)\s+@id\b/);
  assert.match(pessoa, /nome\s+String(?!\?)/);
  assert.match(pessoa, /nomeOriginal\s+String(?!\?)\s+@map\("nome_original"\)/);
  assert.match(pessoa, /sexo\s+Int(?!\?)/);
  assert.match(pessoa, /departamento\s+String(?!\?)/);
  assert.match(pessoa, /popularidade\s+Float(?!\?)/);
  assert.match(pessoa, /adulto\s+Boolean(?!\?)/);
  assert.match(pessoa, /fotoPath\s+String\?\s+@map\("foto_path"\)/);
});

test("CAT-08 o model Elenco usa credit_id como chave", () => {
  const elenco = model("Elenco");
  assert.match(elenco, /@@map\("elenco"\)/);
  assert.match(elenco, /creditId\s+String(?!\?)\s+@id\s+@map\("credit_id"\)/);
  assert.match(elenco, /filmeId\s+Int(?!\?)\s+@map\("filme_id"\)/);
  assert.match(elenco, /pessoaId\s+Int(?!\?)\s+@map\("pessoa_id"\)/);
  assert.match(elenco, /personagem\s+String(?!\?)/);
  assert.match(elenco, /ordem\s+Int(?!\?)/);
  assert.match(elenco, /castId\s+Int(?!\?)\s+@map\("cast_id"\)/);
});

test("CAT-09 o model Lista usa slug como chave", () => {
  const lista = model("Lista");
  assert.match(lista, /@@map\("listas"\)/);
  assert.match(lista, /slug\s+String(?!\?)\s+@id\b/);
});

test("CAT-10 o model ListaFilme tem chave e posição única", () => {
  const posicao = model("ListaFilme");
  assert.match(posicao, /@@map\("lista_filmes"\)/);
  assert.match(posicao, /@@id\(\[listaSlug, filmeId\]\)/);
  assert.match(posicao, /@@unique\(\[listaSlug, posicao\]\)/);
});

test("CAT-33 migrations.seed aponta para node prisma/seed.mjs", () => {
  assert.match(config, /seed:\s*"node prisma\/seed\.mjs"/);
});

test("CAT-34 o script db:seed chama prisma db seed", () => {
  assert.equal(pkg.scripts["db:seed"], "prisma db seed");
});

test("DB-16 os scripts sobem o banco e geram o client antes do build", () => {
  assert.equal(pkg.scripts["db:up"], "docker compose up -d");
  assert.equal(pkg.scripts["db:down"], "docker compose down");
  assert.equal(pkg.scripts.build, "prisma generate && next build");
  assert.equal(pkg.scripts.postinstall, "prisma generate");
});
