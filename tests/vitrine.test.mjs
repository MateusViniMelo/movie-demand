import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import pg from "pg";
import { montarVitrine, urlDoPoster } from "../lib/cartaz.mjs";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const databaseUrl = env
  .split("\n")
  .find((line) => line.startsWith("DATABASE_URL="))
  ?.slice("DATABASE_URL=".length)
  .trim();

test("VIT-05 a URL do pôster usa o host e o tamanho do TMDB", () => {
  assert.equal(urlDoPoster("/abc.jpg", "w500"), "https://image.tmdb.org/t/p/w500/abc.jpg");
  assert.equal(urlDoPoster("/abc.jpg", "w780"), "https://image.tmdb.org/t/p/w780/abc.jpg");
});

test("VIT-01 a VIT-03 a vitrine ordena, omite pôster nulo e separa o destaque", () => {
  const vitrine = montarVitrine([
    { slug: "upcoming", posicao: 2, id: 2, titulo: "Segundo", posterPath: "/b.jpg" },
    { slug: "upcoming", posicao: 1, id: 1, titulo: "Primeiro", posterPath: "/a.jpg" },
    { slug: "upcoming", posicao: 3, id: 3, titulo: "Sem pôster", posterPath: null },
    { slug: "popular", posicao: 2, id: 10, titulo: "P2", posterPath: "/p2.jpg" },
    { slug: "popular", posicao: 1, id: 9, titulo: "P1", posterPath: "/p1.jpg" },
    { slug: "top_rated", posicao: 1, id: 8, titulo: "T", posterPath: "/t.jpg" },
    { slug: "now_playing", posicao: 1, id: 7, titulo: "N", posterPath: "/n.jpg" },
  ]);

  assert.deepEqual(
    vitrine.destaque.map((filme) => filme.id),
    [1, 2],
  );
  assert.equal(vitrine.destaque[0].src, "https://image.tmdb.org/t/p/w780/a.jpg");
  assert.equal(vitrine.destaque[0].titulo, "Primeiro");
  assert.equal(vitrine.destaque[1].src, "https://image.tmdb.org/t/p/w500/b.jpg");
  assert.deepEqual(
    vitrine.fileiras.map((fileira) => fileira.titulo),
    ["Filmes Populares", "Novidades", "Filmes Bem avaliados", "Filmes em Cartaz"],
  );
  assert.deepEqual(
    vitrine.fileiras.map((fileira) => fileira.filmes[0].id),
    [9, 1, 8, 7],
  );
  assert.equal(vitrine.fileiras[1].filmes[0].src, "https://image.tmdb.org/t/p/w500/a.jpg");
  assert.equal(vitrine.fileiras.every((fileira) => fileira.filmes.every((filme) => filme.src.includes("/w500/"))), true);
});

test("VIT-04 a posição 1 do recorte semeado", async () => {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const rows = await client.query(
      `SELECT lf.lista_slug AS slug, lf.posicao, f.id, f.titulo, f.poster_path AS "posterPath"
       FROM lista_filmes lf
       JOIN filmes f ON f.id = lf.filme_id`,
    );
    const vitrine = montarVitrine(rows.rows);
    assert.equal(vitrine.destaque[0].id, 1232569);
    assert.equal(vitrine.fileiras[0].filmes[0].id, 969681);
    assert.equal(vitrine.fileiras[1].filmes[0].id, 1232569);
    assert.equal(vitrine.fileiras[2].filmes[0].id, 1560520);
    assert.equal(vitrine.fileiras[3].filmes[0].id, 1058424);
  } finally {
    await client.end();
  }
});

test("VIT-01 carregarVitrine lê listaFilme ordenado por posicao", () => {
  const fonte = readFileSync(new URL("../lib/vitrine.ts", import.meta.url), "utf8");
  assert.match(fonte, /prisma\.listaFilme\.findMany/);
  assert.match(fonte, /orderBy:\s*\{\s*posicao:\s*"asc"\s*\}/);
  assert.match(fonte, /montarVitrine\(/);
});
