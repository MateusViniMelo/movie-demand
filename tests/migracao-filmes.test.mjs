import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import pg from "pg";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const databaseUrl = env
  .split("\n")
  .find((line) => line.startsWith("DATABASE_URL="))
  ?.slice("DATABASE_URL=".length)
  .trim();

const blocker = new URL("../.specs/features/setup-postgres-prisma/bloqueio-docker.md", import.meta.url);
const migrationsDir = new URL("../prisma/migrations/", import.meta.url);

async function withClient(run) {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

async function colunas(client, table) {
  const rows = await client.query(
    `SELECT column_name, is_nullable, data_type, udt_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table],
  );
  return rows.rows.map((row) => [
    row.column_name,
    row.is_nullable,
    row.udt_name === "jsonb" ? "jsonb" : row.data_type,
  ]);
}

async function chaves(client, table) {
  const rows = await client.query(
    `SELECT pg_get_constraintdef(oid) AS def
     FROM pg_constraint
     WHERE conrelid = $1::regclass AND contype IN ('p', 'u')
     ORDER BY contype, pg_get_constraintdef(oid)`,
    [table],
  );
  return rows.rows.map((row) => row.def);
}

test("CAT-11 a tabela filmes tem as colunas do TMDB", async () => {
  const rows = await withClient((client) => colunas(client, "filmes"));
  assert.deepEqual(rows, [
    ["id", "NO", "integer"],
    ["titulo", "NO", "text"],
    ["titulo_original", "NO", "text"],
    ["sinopse", "NO", "text"],
    ["tagline", "YES", "text"],
    ["data_lancamento", "NO", "date"],
    ["duracao_min", "NO", "integer"],
    ["popularidade", "NO", "double precision"],
    ["nota_media", "NO", "double precision"],
    ["votos", "NO", "integer"],
    ["adulto", "NO", "boolean"],
    ["video", "NO", "boolean"],
    ["softcore", "NO", "boolean"],
    ["idioma_original", "NO", "text"],
    ["imdb_id", "YES", "text"],
    ["homepage", "YES", "text"],
    ["poster_path", "YES", "text"],
    ["backdrop_path", "YES", "text"],
    ["orcamento", "NO", "integer"],
    ["receita", "NO", "bigint"],
    ["status", "NO", "text"],
    ["paises_origem", "NO", "jsonb"],
    ["empresas", "NO", "jsonb"],
    ["paises_producao", "NO", "jsonb"],
    ["idiomas", "NO", "jsonb"],
    ["colecao_id", "YES", "integer"],
  ]);
});

test("CAT-12 generos tem id e nome", async () => {
  const rows = await withClient((client) => colunas(client, "generos"));
  assert.deepEqual(rows, [
    ["id", "NO", "integer"],
    ["nome", "NO", "text"],
  ]);
});

test("CAT-13 colecoes tem caminhos nulos", async () => {
  const rows = await withClient((client) => colunas(client, "colecoes"));
  assert.deepEqual(rows, [
    ["id", "NO", "integer"],
    ["nome", "NO", "text"],
    ["poster_path", "YES", "text"],
    ["backdrop_path", "YES", "text"],
  ]);
});

test("CAT-14 filme_generos tem chave composta", async () => {
  const rows = await withClient((client) => chaves(client, "filme_generos"));
  assert.deepEqual(rows, ['PRIMARY KEY (filme_id, genero_id)']);
});

test("CAT-15 pessoas tem sexo e foto nula", async () => {
  const rows = await withClient((client) => colunas(client, "pessoas"));
  assert.deepEqual(rows, [
    ["id", "NO", "integer"],
    ["nome", "NO", "text"],
    ["nome_original", "NO", "text"],
    ["sexo", "NO", "integer"],
    ["departamento", "NO", "text"],
    ["popularidade", "NO", "double precision"],
    ["adulto", "NO", "boolean"],
    ["foto_path", "YES", "text"],
  ]);
});

test("CAT-16 elenco tem chave credit_id", async () => {
  const cols = await withClient((client) => colunas(client, "elenco"));
  const keys = await withClient((client) => chaves(client, "elenco"));
  assert.deepEqual(cols, [
    ["credit_id", "NO", "text"],
    ["filme_id", "NO", "integer"],
    ["pessoa_id", "NO", "integer"],
    ["personagem", "NO", "text"],
    ["ordem", "NO", "integer"],
    ["cast_id", "NO", "integer"],
  ]);
  assert.deepEqual(keys, ["PRIMARY KEY (credit_id)"]);
});

test("CAT-17 listas tem chave slug", async () => {
  const keys = await withClient((client) => chaves(client, "listas"));
  assert.deepEqual(keys, ["PRIMARY KEY (slug)"]);
});

test("CAT-18 lista_filmes tem chave e posição única", async () => {
  const cols = await withClient((client) => colunas(client, "lista_filmes"));
  const keys = await withClient((client) => chaves(client, "lista_filmes"));
  const indexes = await withClient((client) =>
    client.query(
      `SELECT indexdef FROM pg_indexes
       WHERE schemaname = 'public' AND tablename = 'lista_filmes'`,
    ),
  );
  assert.deepEqual(cols, [
    ["lista_slug", "NO", "text"],
    ["filme_id", "NO", "integer"],
    ["posicao", "NO", "integer"],
  ]);
  assert.deepEqual(keys, ["PRIMARY KEY (lista_slug, filme_id)"]);
  assert.equal(
    indexes.rows.some((row) => row.indexdef === "CREATE UNIQUE INDEX lista_filmes_lista_slug_posicao_key ON public.lista_filmes USING btree (lista_slug, posicao)"),
    true,
  );
});

test("CAT-19 o tipo Origem não existe", async () => {
  const rows = await withClient((client) =>
    client.query("SELECT 1 FROM pg_type WHERE typname = 'Origem'"),
  );
  assert.equal(rows.rowCount, 0);
});

test("CAT-20 a migração do catálogo derruba filmes e não insere", () => {
  const dir = readdirSync(migrationsDir).find((name) => name.endsWith("_catalogo_tmdb"));
  const sql = readFileSync(join(migrationsDir.pathname, dir, "migration.sql"), "utf8");
  assert.match(sql, /DROP TABLE "filmes"/);
  assert.equal(sql.includes("INSERT"), false);
});

test("DB-20 não há bloqueio de daemon quando o banco aceita conexão", async () => {
  await withClient((client) => client.query("SELECT 1"));
  assert.equal(existsSync(blocker), false);
});
