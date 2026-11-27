import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import pg from "pg";
import { formatarDuracao } from "../lib/cartaz.mjs";
import { executarBuscaPorGenero } from "../lib/busca.mjs";

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

test("gênero inexistente no catálogo devolve ausente", async () => {
  const resultado = await withClient((client) =>
    executarBuscaPorGenero(consultar(client), {
      generoId: 999999,
      pagina: 1,
      tamanho: 10,
    }),
  );
  assert.equal(resultado.estado, "ausente");
  assert.deepEqual(resultado.filmes, []);
  assert.equal(resultado.total, 0);
  assert.equal(Object.hasOwn(resultado, "genero"), false);
});

test("gênero Faroeste sem filmes devolve nenhum", async () => {
  const resultado = await withClient((client) =>
    executarBuscaPorGenero(consultar(client), {
      generoId: 37,
      pagina: 1,
      tamanho: 10,
    }),
  );
  assert.equal(resultado.estado, "nenhum");
  assert.deepEqual(resultado.filmes, []);
  assert.equal(resultado.total, 0);
  assert.deepEqual(resultado.genero, { id: 37, nome: "Faroeste" });
});

test("união de dois gêneros devolve filmes de pelo menos um", async () => {
  await withClient(async (client) => {
    const esperado = await client.query(
      `SELECT DISTINCT f.id
       FROM filmes f
       JOIN filme_generos fg ON fg.filme_id = f.id
       WHERE fg.genero_id = ANY($1::int[])
       ORDER BY f.id ASC`,
      [[12, 28]],
    );
    const resultado = await executarBuscaPorGenero(consultar(client), {
      generoIds: [12, 28],
      pagina: 1,
      tamanho: 10,
    });
    assert.equal(resultado.estado, "ok");
    assert.equal(resultado.total, esperado.rows.length);
    assert.equal(Object.hasOwn(resultado, "genero"), false);
    assert.ok(resultado.generos?.some((item) => item.id === 12));
    assert.ok(resultado.generos?.some((item) => item.id === 28));
  });
});

test("Aventura filtra, ordena por popularidade e pagina", async () => {
  await withClient(async (client) => {
    const esperado = await client.query(
      `SELECT f.id, f.titulo, f.popularidade, f.duracao_min, f.backdrop_path, f.poster_path
       FROM filmes f
       JOIN filme_generos fg ON fg.filme_id = f.id
       WHERE fg.genero_id = 12
       ORDER BY f.popularidade DESC, f.id ASC`,
    );
    assert.ok(esperado.rows.length >= 11);

    const pagina1 = await executarBuscaPorGenero(consultar(client), {
      generoId: 12,
      pagina: 1,
      tamanho: 10,
    });
    assert.equal(pagina1.estado, "ok");
    assert.deepEqual(pagina1.genero, { id: 12, nome: "Aventura" });
    assert.equal(pagina1.total, esperado.rows.length);
    assert.equal(pagina1.pagina, 1);
    assert.equal(pagina1.paginas, Math.ceil(esperado.rows.length / 10));
    assert.equal(pagina1.filmes.length, 10);
    assert.deepEqual(
      pagina1.filmes.map((filme) => filme.id),
      esperado.rows.slice(0, 10).map((linha) => Number(linha.id)),
    );

    const primeiro = pagina1.filmes[0];
    assert.equal(primeiro.id, 969681);
    assert.equal(primeiro.titulo, "Homem-Aranha: Um Novo Dia");
    assert.equal(primeiro.genero, "Aventura");
    assert.equal(primeiro.duracao, formatarDuracao(143));
    assert.equal(
      primeiro.banner,
      "https://image.tmdb.org/t/p/w780/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg",
    );

    const pagina2 = await executarBuscaPorGenero(consultar(client), {
      generoId: 12,
      pagina: 2,
      tamanho: 10,
    });
    assert.equal(pagina2.pagina, 2);
    assert.deepEqual(
      pagina2.filmes.map((filme) => filme.id),
      esperado.rows.slice(10, 20).map((linha) => Number(linha.id)),
    );

    const paginaAlta = await executarBuscaPorGenero(consultar(client), {
      generoId: 12,
      pagina: 99,
      tamanho: 10,
    });
    assert.equal(paginaAlta.pagina, pagina1.paginas);
    assert.deepEqual(
      paginaAlta.filmes.map((filme) => filme.id),
      pagina2.filmes.map((filme) => filme.id),
    );
  });
});
