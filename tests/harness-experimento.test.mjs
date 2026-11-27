import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { executarHarnessExperimento } from "../lib/harness-experimento.mjs";

function memoriaArmazenamento() {
  /** @type {Map<string, string>} */
  const dados = new Map();
  /** @type {Array<{ chave: string; valor: string; ttlSegundos: number }>} */
  const gravacoes = [];
  /** @type {string[]} */
  const leituras = [];
  return {
    dados,
    gravacoes,
    leituras,
    async ler(chave) {
      leituras.push(chave);
      return dados.has(chave) ? dados.get(chave) : null;
    },
    async gravar(chave, valor, ttlSegundos) {
      dados.set(chave, valor);
      gravacoes.push({ chave, valor, ttlSegundos });
    },
  };
}

const filmeExemplo = {
  id: 155,
  titulo: "O Poderoso Chefão",
  elencos: [{ personagem: "Vito", ordem: 0, pessoaId: 1, pessoa: { nome: "Marlon" } }],
};

const vitrineExemplo = {
  fileiras: [{ slug: "upcoming", titulo: "Em breve", itens: [{ id: 1, titulo: "A" }] }],
};

test("HAR-01 cenário A em C1 devolve valor, latência ≥ 0 e acerto N/A sem tocar no armazenamento", async () => {
  const armazenamento = memoriaArmazenamento();
  let chamadas = 0;

  const resultado = await executarHarnessExperimento({
    operacao: "C1",
    cenario: "A",
    filmeId: 155,
    armazenamento,
    carregarFilme: async (id) => {
      chamadas += 1;
      assert.equal(id, 155);
      return filmeExemplo;
    },
  });

  assert.deepEqual(resultado.valor, filmeExemplo);
  assert.equal(typeof resultado.latenciaMs, "number");
  assert.ok(Number.isFinite(resultado.latenciaMs));
  assert.ok(resultado.latenciaMs >= 0);
  assert.equal(resultado.acerto, null);
  assert.equal(chamadas, 1);
  assert.equal(armazenamento.leituras.length, 0);
  assert.equal(armazenamento.gravacoes.length, 0);
});

test("HAR-02 cenário B em C1 faz miss depois hit no mesmo armazenamento", async () => {
  const armazenamento = memoriaArmazenamento();
  let chamadas = 0;
  const carregarFilme = async () => {
    chamadas += 1;
    return filmeExemplo;
  };

  const primeiro = await executarHarnessExperimento({
    operacao: "C1",
    cenario: "B",
    filmeId: 155,
    armazenamento,
    carregarFilme,
  });
  assert.deepEqual(primeiro.valor, filmeExemplo);
  assert.equal(primeiro.acerto, false);
  assert.ok(primeiro.latenciaMs >= 0);
  assert.equal(chamadas, 1);
  assert.equal(armazenamento.gravacoes.length, 1);

  const segundo = await executarHarnessExperimento({
    operacao: "C1",
    cenario: "B",
    filmeId: 155,
    armazenamento,
    carregarFilme,
  });
  assert.deepEqual(segundo.valor, filmeExemplo);
  assert.equal(segundo.acerto, true);
  assert.ok(segundo.latenciaMs >= 0);
  assert.equal(chamadas, 1);
});

test("HAR-03 C2 no cenário A usa o mesmo carregador da ficha e não toca no armazenamento", async () => {
  const armazenamento = memoriaArmazenamento();
  let chamadas = 0;

  const resultado = await executarHarnessExperimento({
    operacao: "C2",
    cenario: "A",
    filmeId: 155,
    armazenamento,
    carregarFilme: async (id) => {
      chamadas += 1;
      assert.equal(id, 155);
      return filmeExemplo;
    },
  });

  assert.deepEqual(resultado.valor, filmeExemplo);
  assert.equal(resultado.acerto, null);
  assert.ok(resultado.latenciaMs >= 0);
  assert.equal(chamadas, 1);
  assert.equal(armazenamento.leituras.length, 0);
  assert.equal(armazenamento.gravacoes.length, 0);
});

test("HAR-04 C2 no cenário B compartilha o cache-aside da ficha (miss → hit)", async () => {
  const armazenamento = memoriaArmazenamento();
  let chamadas = 0;
  const carregarFilme = async () => {
    chamadas += 1;
    return filmeExemplo;
  };

  const primeiro = await executarHarnessExperimento({
    operacao: "C2",
    cenario: "B",
    filmeId: 155,
    armazenamento,
    carregarFilme,
  });
  assert.equal(primeiro.acerto, false);

  const segundo = await executarHarnessExperimento({
    operacao: "C1",
    cenario: "B",
    filmeId: 155,
    armazenamento,
    carregarFilme,
  });
  assert.equal(segundo.acerto, true);
  assert.deepEqual(segundo.valor, filmeExemplo);
  assert.equal(chamadas, 1);
});

test("HAR-05 C4 cenário A não lê nem grava; C4 cenário B faz miss depois hit", async () => {
  const armazenamento = memoriaArmazenamento();
  let chamadas = 0;
  const carregarVitrine = async () => {
    chamadas += 1;
    return vitrineExemplo;
  };

  const baseline = await executarHarnessExperimento({
    operacao: "C4",
    cenario: "A",
    armazenamento,
    carregarVitrine,
  });
  assert.deepEqual(baseline.valor, vitrineExemplo);
  assert.equal(baseline.acerto, null);
  assert.ok(baseline.latenciaMs >= 0);
  assert.equal(armazenamento.leituras.length, 0);
  assert.equal(armazenamento.gravacoes.length, 0);
  assert.equal(chamadas, 1);

  const miss = await executarHarnessExperimento({
    operacao: "C4",
    cenario: "B",
    armazenamento,
    carregarVitrine,
  });
  assert.equal(miss.acerto, false);
  assert.equal(chamadas, 2);

  const hit = await executarHarnessExperimento({
    operacao: "C4",
    cenario: "B",
    armazenamento,
    carregarVitrine,
  });
  assert.equal(hit.acerto, true);
  assert.deepEqual(hit.valor, vitrineExemplo);
  assert.equal(chamadas, 2);
});

test("HAR-06 paridade de valor entre cenário A e B para a mesma entrada", async () => {
  const armazenamento = memoriaArmazenamento();
  const carregarFilme = async () => filmeExemplo;

  const a = await executarHarnessExperimento({
    operacao: "C1",
    cenario: "A",
    filmeId: 155,
    armazenamento,
    carregarFilme,
  });
  const b = await executarHarnessExperimento({
    operacao: "C1",
    cenario: "B",
    filmeId: 155,
    armazenamento,
    carregarFilme,
  });

  assert.deepEqual(a.valor, b.valor);
  assert.equal(a.acerto, null);
  assert.equal(b.acerto, false);
});

test("HAR-07 operação C3 ou desconhecida falha de forma explícita", async () => {
  await assert.rejects(
    () =>
      executarHarnessExperimento({
        operacao: "C3",
        cenario: "A",
        filmeId: 1,
        carregarFilme: async () => null,
      }),
    /Operação desconhecida/,
  );
  await assert.rejects(
    () =>
      executarHarnessExperimento({
        operacao: "C9",
        cenario: "B",
        filmeId: 1,
        carregarFilme: async () => null,
        armazenamento: memoriaArmazenamento(),
      }),
    /Operação desconhecida/,
  );
});

test("HAR-08 páginas do catálogo não importam o harness nem expõem toggle A/B", () => {
  const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const filmePage = readFileSync(
    new URL("../app/filme/[id]/page.tsx", import.meta.url),
    "utf8",
  );
  assert.equal(page.includes("harness-experimento"), false);
  assert.equal(filmePage.includes("harness-experimento"), false);
  assert.equal(page.includes("cenario"), false);
  assert.equal(filmePage.includes("cenario"), false);
});

test("HAR-09 contrato documenta operações, cenários e campos de retorno", () => {
  const fonte = readFileSync(
    new URL("../lib/harness-experimento.mjs", import.meta.url),
    "utf8",
  );
  assert.match(fonte, /C1/);
  assert.match(fonte, /C2/);
  assert.match(fonte, /C4/);
  assert.match(fonte, /cenário A/i);
  assert.match(fonte, /cenário B/i);
  assert.match(fonte, /latenciaMs/);
  assert.match(fonte, /acerto/);
  assert.match(fonte, /executarHarnessExperimento/);
});
