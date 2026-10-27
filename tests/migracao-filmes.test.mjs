import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import pg from "pg";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const databaseUrl = env
  .split("\n")
  .find((line) => line.startsWith("DATABASE_URL="))
  ?.slice("DATABASE_URL=".length)
  .trim();

const blocker = new URL("../.specs/features/setup-postgres-prisma/bloqueio-docker.md", import.meta.url);

async function withClient(run) {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

test("DB-17 a tabela filmes tem as oito colunas NOT NULL", async () => {
  const rows = await withClient((client) =>
    client.query(
      `SELECT column_name, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'filmes'
       ORDER BY ordinal_position`,
    ),
  );
  assert.deepEqual(
    rows.rows.map((row) => [row.column_name, row.is_nullable]),
    [
      ["id", "NO"],
      ["titulo", "NO"],
      ["descricao", "NO"],
      ["genero", "NO"],
      ["duracao_min", "NO"],
      ["url_midia", "NO"],
      ["origem", "NO"],
      ["tags", "NO"],
    ],
  );
});

test("DB-18 os tipos são integer, text e ARRAY", async () => {
  const rows = await withClient((client) =>
    client.query(
      `SELECT column_name, data_type, udt_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'filmes'
       ORDER BY ordinal_position`,
    ),
  );
  const byName = Object.fromEntries(rows.rows.map((row) => [row.column_name, row]));
  assert.equal(byName.id.data_type, "integer");
  assert.equal(byName.duracao_min.data_type, "integer");
  assert.equal(byName.tags.data_type, "ARRAY");
  for (const name of ["titulo", "descricao", "genero", "url_midia"]) {
    assert.equal(byName[name].data_type, "text");
  }
  assert.equal(byName.origem.udt_name, "Origem");
});

test("DB-19 a tabela filmes contém 0 linhas", async () => {
  const rows = await withClient((client) => client.query("SELECT COUNT(*)::int AS total FROM filmes"));
  assert.equal(rows.rows[0].total, 0);
});

test("DB-20 não há bloqueio de daemon quando o banco aceita conexão", async () => {
  await withClient((client) => client.query("SELECT 1"));
  assert.equal(existsSync(blocker), false);
});
