import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import pg from "pg";
import { semear } from "../prisma/seed.mjs";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const databaseUrl = env
  .split("\n")
  .find((line) => line.startsWith("DATABASE_URL="))
  ?.slice("DATABASE_URL=".length)
  .trim();

const raiz = new URL("../data/tmdb/", import.meta.url).pathname;
const ESPERADO = {
  filmes: 72,
  generos: 19,
  colecoes: 16,
  pessoas: 2563,
  elenco: 2680,
  listas: 4,
  lista_filmes: 80,
};

async function contagens(client) {
  const totais = {};
  for (const table of Object.keys(ESPERADO)) {
    const rows = await client.query(`SELECT COUNT(*)::int AS total FROM ${table}`);
    totais[table] = rows.rows[0].total;
  }
  return totais;
}

function filmeMinimo(id, generoId = 28) {
  return { id, genres: [{ id: generoId, name: "Ação" }] };
}

async function diretorio(listas) {
  const dir = await mkdtemp(path.join(tmpdir(), "catalogo-"));
  await mkdir(path.join(dir, "elenco"));
  await writeFile(
    path.join(dir, "generos.json"),
    JSON.stringify({ genres: [{ id: 28, name: "Ação" }] }),
  );
  for (const slug of ["popular", "now_playing", "upcoming", "top_rated"]) {
    const results = listas[slug] ?? Array.from({ length: 20 }, (_, index) => filmeMinimo(1000 + index));
    await writeFile(path.join(dir, `${slug}.json`), JSON.stringify({ results }));
  }
  return dir;
}

test("CAT o seed persiste o recorte de data/tmdb", async (t) => {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await t.test("CAT-21 as contagens do recorte", async () => {
      await semear(client, raiz);
      assert.deepEqual(await contagens(client), ESPERADO);
    });

    await t.test("CAT-22 o filme 969681 guarda ficha, receita e coleção", async () => {
      const rows = await client.query(
        `SELECT titulo, duracao_min, orcamento, receita::text AS receita,
                data_lancamento::text AS data_lancamento, colecao_id, empresas
         FROM filmes WHERE id = 969681`,
      );
      const filme = rows.rows[0];
      assert.equal(filme.titulo, "Homem-Aranha: Um Novo Dia");
      assert.equal(filme.duracao_min, 143);
      assert.equal(filme.orcamento, 225000000);
      assert.equal(filme.receita, "2517281128");
      assert.equal(filme.data_lancamento, "2026-07-29");
      assert.equal(filme.colecao_id, 531241);
      assert.equal(filme.empresas.some((empresa) => empresa.name === "Marvel Studios"), true);
    });

    await t.test("CAT-23 a nota do filme 969681 fica a menos de 0.000001 de 8.473", async () => {
      const rows = await client.query("SELECT nota_media FROM filmes WHERE id = 969681");
      assert.equal(Math.abs(rows.rows[0].nota_media - 8.473) < 0.000001, true);
    });

    await t.test("CAT-24 o filme 1712451 tem sinopse vazia", async () => {
      const rows = await client.query("SELECT sinopse FROM filmes WHERE id = 1712451");
      assert.equal(rows.rows[0].sinopse, "");
    });

    await t.test("CAT-25 o gênero 28 se chama Ação", async () => {
      const rows = await client.query("SELECT nome FROM generos WHERE id = 28");
      assert.equal(rows.rows[0].nome, "Ação");
    });

    await t.test("CAT-26 Christian Bale interpreta Bruce Wayne no filme 155", async () => {
      const rows = await client.query(
        `SELECT e.filme_id, e.pessoa_id, e.personagem, e.ordem, p.nome
         FROM elenco e
         JOIN pessoas p ON p.id = e.pessoa_id
         WHERE e.credit_id = '52fe4220c3a36847f8005d17'`,
      );
      const credito = rows.rows[0];
      assert.equal(credito.filme_id, 155);
      assert.equal(credito.pessoa_id, 3894);
      assert.equal(credito.nome, "Christian Bale");
      assert.equal(credito.personagem, "Bruce Wayne");
      assert.equal(credito.ordem, 0);
    });

    await t.test("CAT-27 a posição 1 de cada lista", async () => {
      const rows = await client.query(
        `SELECT lista_slug, filme_id FROM lista_filmes WHERE posicao = 1 ORDER BY lista_slug`,
      );
      assert.deepEqual(
        rows.rows.map((row) => [row.lista_slug, row.filme_id]),
        [
          ["now_playing", 1058424],
          ["popular", 969681],
          ["top_rated", 1560520],
          ["upcoming", 1232569],
        ],
      );
    });

    await t.test("CAT-28 cada lista vai de 1 a 20 e oito filmes se repetem", async () => {
      const faixas = await client.query(
        `SELECT lista_slug, COUNT(*)::int AS total, MIN(posicao) AS minima, MAX(posicao) AS maxima
         FROM lista_filmes GROUP BY lista_slug ORDER BY lista_slug`,
      );
      assert.deepEqual(
        faixas.rows.map((row) => [row.lista_slug, row.total, row.minima, row.maxima]),
        [
          ["now_playing", 20, 1, 20],
          ["popular", 20, 1, 20],
          ["top_rated", 20, 1, 20],
          ["upcoming", 20, 1, 20],
        ],
      );
      const repetidos = await client.query(
        `SELECT COUNT(*)::int AS total FROM (
           SELECT filme_id FROM lista_filmes GROUP BY filme_id HAVING COUNT(*) > 1
         ) repetidos`,
      );
      assert.equal(repetidos.rows[0].total, 8);
    });

    await t.test("CAT-29 a segunda execução mantém 72, 2680 e 80", async () => {
      await semear(client, raiz);
      const totais = await contagens(client);
      assert.equal(totais.filmes, 72);
      assert.equal(totais.elenco, 2680);
      assert.equal(totais.lista_filmes, 80);
    });

    await t.test("CAT-30 lista sem 20 filmes não altera o banco", async () => {
      for (const total of [0, 21]) {
        const dir = await diretorio({
          popular: Array.from({ length: total }, (_, index) => filmeMinimo(3000 + index)),
        });
        try {
          await assert.rejects(() => semear(client, dir), (error) => {
            assert.equal(error.message.includes("popular"), true);
            assert.equal(error.message.includes("20"), true);
            return true;
          });
          const totais = await contagens(client);
          assert.equal(totais.filmes, 72);
          assert.equal(totais.elenco, 2680);
          assert.equal(totais.lista_filmes, 80);
        } finally {
          await rm(dir, { recursive: true, force: true });
        }
      }
    });

    await t.test("CAT-31 elenco ausente não altera o banco", async () => {
      const vinte = Array.from({ length: 20 }, (_, index) => filmeMinimo(index + 1));
      const dir = await diretorio({
        popular: vinte,
        now_playing: vinte,
        upcoming: vinte,
        top_rated: vinte,
      });
      try {
        await assert.rejects(() => semear(client, dir), (error) => {
          assert.match(error.message, /elenco\/1\.json/);
          return true;
        });
        const totais = await contagens(client);
        assert.equal(totais.filmes, 72);
        assert.equal(totais.elenco, 2680);
        assert.equal(totais.lista_filmes, 80);
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });

    await t.test("CAT-32 gênero fora do catálogo não altera o banco", async () => {
      const vinte = Array.from({ length: 20 }, (_, index) => filmeMinimo(index + 1));
      vinte[0] = filmeMinimo(1, 99999);
      const dir = await diretorio({
        popular: vinte,
        now_playing: vinte,
        upcoming: vinte,
        top_rated: vinte,
      });
      try {
        await assert.rejects(() => semear(client, dir), (error) => {
          assert.equal(error.message.includes("99999"), true);
          return true;
        });
        const totais = await contagens(client);
        assert.equal(totais.filmes, 72);
        assert.equal(totais.elenco, 2680);
        assert.equal(totais.lista_filmes, 80);
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });
  } finally {
    await client.end();
  }
});
