import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import pg from "pg";
import { formatarDuracao } from "../lib/cartaz.mjs";
import { executarBusca, tsqueryDaBusca, textoDaBusca, vetorSql } from "../lib/busca.mjs";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const databaseUrl = env
  .split("\n")
  .find((line) => line.startsWith("DATABASE_URL="))
  ?.slice("DATABASE_URL=".length)
  .trim();

function consultar(client) {
  return (sql, params) => client.query(sql, params).then((resultado) => resultado.rows);
}

async function withClient(run) {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

test("BUS-15 hom encontra Homem-Aranha: Um Novo Dia", async () => {
  const resultado = await withClient((client) =>
    executarBusca(consultar(client), { texto: "hom", pagina: 1, tamanho: 10 }),
  );
  const filme = resultado.filmes.find((item) => item.id === 969681);
  assert.ok(filme);
  assert.equal(filme.titulo, "Homem-Aranha: Um Novo Dia");
  assert.equal(filme.genero, "Aventura");
  assert.equal(filme.duracao, formatarDuracao(143));
  assert.equal(
    filme.banner,
    "https://image.tmdb.org/t/p/w780/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg",
  );
  assert.equal(Object.hasOwn(filme, "ts_rank"), false);
  assert.equal(tsqueryDaBusca(textoDaBusca("hom")), "hom:*");
});

test("BUS-14 empate de relevância ordena pelo id crescente", async () => {
  await withClient(async (client) => {
    const consulta = "hom:*";
    const ranks = await client.query(
      `SELECT id, ts_rank(${vetorSql}, to_tsquery('portuguese', $1)) AS rank
       FROM filmes
       WHERE id IN (278, 389, 969681)`,
      [consulta],
    );
    const porId = new Map(ranks.rows.map((linha) => [Number(linha.id), Number(linha.rank)]));
    assert.ok(porId.get(969681) > porId.get(278));
    assert.equal(porId.get(278), porId.get(389));

    const resultado = await executarBusca(consultar(client), {
      texto: "hom",
      pagina: 1,
      tamanho: 10,
    });
    const ids = resultado.filmes.map((filme) => filme.id);
    assert.ok(ids.indexOf(969681) < ids.indexOf(278));
    assert.ok(ids.indexOf(278) < ids.indexOf(389));
    for (const filme of resultado.filmes) {
      assert.equal(Object.hasOwn(filme, "ts_rank"), false);
    }
  });
});

test("BUS-20 stopword sozinha devolve nenhum e o texto vazio não consulta", async () => {
  let chamou = false;
  const vazio = await executarBusca(
    () => {
      chamou = true;
      return Promise.resolve([]);
    },
    { texto: "   ", pagina: 1, tamanho: 5 },
  );
  assert.equal(vazio.estado, "vazio");
  assert.deepEqual(vazio.filmes, []);
  assert.equal(vazio.total, 0);
  assert.equal(chamou, false);

  const nenhum = await withClient((client) =>
    executarBusca(consultar(client), { texto: "de", pagina: 1, tamanho: 5 }),
  );
  assert.equal(nenhum.estado, "nenhum");
  assert.deepEqual(nenhum.filmes, []);
  assert.equal(nenhum.total, 0);
});
