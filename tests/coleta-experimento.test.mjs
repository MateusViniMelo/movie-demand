import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import pg from "pg";
import {
  AMOSTRA_COLETA_PADRAO,
  PROTOCOLO_COLETA_PADRAO,
  formatarTabelaSecao10,
  parseArgumentosColeta,
  resolverAmostraColeta,
  rotuloCenarioSecao10,
} from "../lib/coleta-experimento.mjs";

test("CLI-01 protocolo padrão N=50, warm-up=5, concorrência=1", () => {
  assert.deepEqual(PROTOCOLO_COLETA_PADRAO, {
    n: 50,
    warmUp: 5,
    concorrencia: 1,
  });
});

test("CLI-02 parseArgumentosColeta usa defaults sem flags", () => {
  const opcoes = parseArgumentosColeta(["node", "coleta"]);
  assert.deepEqual(opcoes, {
    ...PROTOCOLO_COLETA_PADRAO,
    amostra: { ...AMOSTRA_COLETA_PADRAO },
  });
});

test("CLI-03 parseArgumentosColeta aceita overrides de N, warm-up e concorrência", () => {
  const opcoes = parseArgumentosColeta([
    "node",
    "coleta",
    "--n",
    "10",
    "--warm-up",
    "2",
    "--concorrencia",
    "5",
    "--filme-id",
    "155",
    "--genero-id",
    "28",
  ]);
  assert.equal(opcoes.n, 10);
  assert.equal(opcoes.warmUp, 2);
  assert.equal(opcoes.concorrencia, 5);
  assert.deepEqual(opcoes.amostra, {
    filmeId: 155,
    generoId: 28,
    pagina: 1,
    tamanho: 10,
  });
});

test("CLI-04 rotuloCenarioSecao10 mapeia A e cenários Redis", () => {
  assert.equal(rotuloCenarioSecao10("A"), "PostgreSQL");
  assert.equal(rotuloCenarioSecao10("B-cold"), "Redis (cache vazio)");
  assert.equal(rotuloCenarioSecao10("B-warm"), "Redis (cache quente)");
});

test("CLI-05 formatarTabelaSecao10 emite cabeçalho §10.1 e linhas ordenadas", () => {
  const tabela = formatarTabelaSecao10([
    {
      operacao: "C1",
      cenario: "A",
      latenciaMedia: 12.3456,
      mediana: 10,
      p95: 20.1,
      throughput: 4.567,
      hitRate: undefined,
      reducaoPercentual: undefined,
    },
    {
      operacao: "C1",
      cenario: "B-warm",
      latenciaMedia: 1.2,
      mediana: 1,
      p95: 2,
      throughput: 40,
      hitRate: 98,
      reducaoPercentual: 90.25,
    },
  ]);

  assert.match(tabela, /\| Operação \| Cenário \| Latência média \| Mediana \| P95 \| Throughput \|/);
  assert.match(tabela, /\| C1 \| PostgreSQL \| 12\.35 \| 10\.00 \| 20\.10 \| 4\.57 \|/);
  assert.match(tabela, /\| C1 \| Redis \(cache quente\) \| 1\.20 \| 1\.00 \| 2\.00 \| 40\.00 \|/);
  assert.match(tabela, /Hit rate \(B\): C1 B-warm 98\.00%/);
  assert.match(tabela, /Redução \(B-warm vs A\): C1 90\.25%/);
});

test("CLI-06 amostra padrão alinha com o seed (filme 969681, gênero Aventura)", () => {
  assert.deepEqual(AMOSTRA_COLETA_PADRAO, {
    filmeId: 969681,
    generoId: 12,
    pagina: 1,
    tamanho: 10,
  });
});

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const databaseUrl = env
  .split("\n")
  .find((line) => line.startsWith("DATABASE_URL="))
  ?.slice("DATABASE_URL=".length)
  .trim();

test("CLI-07 resolverAmostraColeta confirma ids no banco semeado", async (t) => {
  if (!databaseUrl) {
    t.skip("DATABASE_URL ausente");
    return;
  }
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const amostra = await resolverAmostraColeta(client, AMOSTRA_COLETA_PADRAO);
    assert.deepEqual(amostra, AMOSTRA_COLETA_PADRAO);
    const filme = await client.query("SELECT titulo FROM filmes WHERE id = $1", [
      amostra.filmeId,
    ]);
    assert.equal(filme.rows[0]?.titulo, "Homem-Aranha: Um Novo Dia");
  } finally {
    await client.end();
  }
});

test("CLI-08 app/ e components/ não importam a coleta nem redis direto", () => {
  const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const filmePage = readFileSync(
    new URL("../app/filme/[id]/page.tsx", import.meta.url),
    "utf8",
  );
  for (const fonte of [page, filmePage]) {
    assert.equal(fonte.includes("coleta-experimento"), false);
    assert.equal(fonte.includes("scripts/coleta"), false);
  }
});

test("CLI-09 package.json expõe experimento:coleta", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.scripts["experimento:coleta"], "node scripts/coleta-experimento.mjs");
});

test("CLI-10 experimento.md fixa N, warm-up e concorrência do protocolo", () => {
  const doc = readFileSync(
    new URL("../.specs/experimento/experimento.md", import.meta.url),
    "utf8",
  );
  assert.match(doc, /\*\*N\*\*[\s\S]*\*\*50\*\*/);
  assert.match(doc, /Warm-up[\s\S]*\*\*5\*\*/i);
  assert.match(doc, /Concorrência[\s\S]*\*\*1\*\*/i);
  assert.match(doc, /concorrência\s+\*\*1\*\*,\s*\*\*5\*\*\s+e\s*\*\*10\*\*/i);
  assert.doesNotMatch(doc, /serão definidos antes da execução/i);
});