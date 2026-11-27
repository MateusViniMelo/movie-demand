import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { executarSerieExperimento } from "../lib/serie-experimento.mjs";

function memoriaArmazenamento() {
  /** @type {Map<string, string>} */
  const dados = new Map();
  return {
    dados,
    async ler(chave) {
      return dados.has(chave) ? dados.get(chave) : null;
    },
    async gravar(chave, valor) {
      dados.set(chave, valor);
    },
  };
}

const amostraMinima = {
  filmeId: 155,
  generoIds: [18],
  pagina: 1,
  tamanho: 10,
};

function depsMinimas(armazenamento) {
  return {
    armazenamento,
    flush: async () => {},
    carregarFilme: async () => ({ id: 155 }),
    carregarFilmesPorGenero: async () => ({
      estado: "ok",
      filmes: [],
      total: 0,
      pagina: 1,
      paginas: 0,
    }),
    carregarVitrine: async () => ({ fileiras: [] }),
  };
}

test("SER-01 defaults N=50 e warm-up=5 sem precisar passar na chamada", () => {
  const fonte = readFileSync(
    new URL("../lib/serie-experimento.mjs", import.meta.url),
    "utf8",
  );
  assert.match(fonte, /n\s*=\s*50|n:\s*50|N\s*=\s*50/i);
  assert.match(fonte, /warmUp\s*=\s*5|warmUp:\s*5|warm-up\s*=\s*5/i);
});

test("SER-02 warm-up é descartado da agregação (média só das N amostras)", async () => {
  const armazenamento = memoriaArmazenamento();
  let chamadas = 0;
  const latencias = [900, 900, 900, 900, 900, 10, 20, 30];
  const executarHarness = async () => {
    const latenciaMs = latencias[chamadas] ?? 30;
    chamadas += 1;
    return { valor: {}, latenciaMs, acerto: null };
  };

  const resultado = await executarSerieExperimento({
    operacoes: ["C1"],
    cenarios: ["A"],
    n: 3,
    warmUp: 5,
    amostra: amostraMinima,
    executarHarness,
    ...depsMinimas(armazenamento),
  });

  const celula = resultado.celulas.find(
    (c) => c.operacao === "C1" && c.cenario === "A",
  );
  assert.ok(celula);
  assert.equal(chamadas, 8);
  assert.equal(celula.latenciaMedia, 20);
  assert.equal(celula.mediana, 20);
});

test("SER-03 flush só antes da célula B-cold, não entre iterações B-warm", async () => {
  const armazenamento = memoriaArmazenamento();
  const flushRegistro = [];
  const flush = async (ctx) => {
    flushRegistro.push(ctx);
  };
  const executarHarness = async () => ({
    valor: {},
    latenciaMs: 1,
    acerto: false,
  });

  await executarSerieExperimento({
    ...depsMinimas(armazenamento),
    operacoes: ["C4"],
    cenarios: ["B-cold", "B-warm"],
    n: 2,
    warmUp: 1,
    amostra: amostraMinima,
    executarHarness,
    flush,
  });

  assert.equal(flushRegistro.length, 1);
  assert.deepEqual(flushRegistro[0], { operacao: "C4", cenario: "B-cold" });
});

test("SER-04 agrega média, mediana, P95 e throughput (N/T amostra)", async () => {
  const armazenamento = memoriaArmazenamento();
  const latenciasAmostra = [10, 20, 30, 40, 50];
  let fase = "warm";
  let indiceAmostra = 0;
  const executarHarness = async () => {
    if (fase === "warm") {
      fase = "amostra";
      return { valor: {}, latenciaMs: 999, acerto: null };
    }
    const latenciaMs = latenciasAmostra[indiceAmostra];
    indiceAmostra += 1;
    return { valor: {}, latenciaMs, acerto: null };
  };

  const resultado = await executarSerieExperimento({
    operacoes: ["C3"],
    cenarios: ["A"],
    n: 5,
    warmUp: 1,
    amostra: amostraMinima,
    executarHarness,
    ...depsMinimas(armazenamento),
  });

  const celula = resultado.celulas[0];
  assert.equal(celula.latenciaMedia, 30);
  assert.equal(celula.mediana, 30);
  assert.equal(celula.p95, 50);
  assert.ok(celula.throughput > 0);
  assert.equal(typeof celula.tempoAmostraMs, "number");
  assert.ok(celula.tempoAmostraMs >= 0);
  const esperado = 5 / (celula.tempoAmostraMs / 1000);
  assert.ok(Math.abs(celula.throughput - esperado) < 0.001);
});

test("SER-05 hit-rate só no cenário B (cold e warm), fora do warm-up", async () => {
  const armazenamento = memoriaArmazenamento();
  let chamadas = 0;
  const executarHarness = async ({ cenario }) => {
    chamadas += 1;
    const amostra = chamadas > 1;
    const acerto =
      cenario === "A" ? null : amostra && chamadas % 2 === 0;
    return { valor: {}, latenciaMs: 1, acerto };
  };

  const resultado = await executarSerieExperimento({
    operacoes: ["C1"],
    cenarios: ["A", "B-cold"],
    n: 4,
    warmUp: 1,
    amostra: amostraMinima,
    executarHarness,
    flush: async () => {},
    ...depsMinimas(armazenamento),
  });

  const a = resultado.celulas.find((c) => c.cenario === "A");
  const b = resultado.celulas.find((c) => c.cenario === "B-cold");
  assert.equal(a.hitRate, undefined);
  assert.equal(b.hitRate, 50);
});

test("SER-06 redução % A→B-warm quando ambas as células existem", async () => {
  const armazenamento = memoriaArmazenamento();
  const medias = { A: 100, "B-warm": 40 };
  const executarHarness = async ({ cenario }) => ({
    valor: {},
    latenciaMs: cenario === "A" ? medias.A : medias["B-warm"],
    acerto: cenario === "A" ? null : true,
  });

  const resultado = await executarSerieExperimento({
    operacoes: ["C2"],
    cenarios: ["A", "B-warm"],
    n: 3,
    warmUp: 0,
    amostra: amostraMinima,
    executarHarness,
    flush: async () => {},
    ...depsMinimas(armazenamento),
  });

  const warm = resultado.celulas.find((c) => c.cenario === "B-warm");
  assert.equal(warm.reducaoPercentual, 60);
});

test("SER-07 parâmetros inválidos falham de forma explícita", async () => {
  const deps = { ...depsMinimas(memoriaArmazenamento()), flush: async () => {} };
  await assert.rejects(
    () =>
      executarSerieExperimento({
        n: 0,
        warmUp: 1,
        amostra: amostraMinima,
        ...deps,
      }),
    /n/i,
  );
  await assert.rejects(
    () =>
      executarSerieExperimento({
        warmUp: -1,
        n: 2,
        amostra: amostraMinima,
        ...deps,
      }),
    /warm/i,
  );
  await assert.rejects(
    () =>
      executarSerieExperimento({
        concorrencia: 7,
        n: 2,
        warmUp: 0,
        amostra: amostraMinima,
        ...deps,
      }),
    /concorr/i,
  );
  await assert.rejects(
    () =>
      executarSerieExperimento({
        operacoes: ["C9"],
        n: 2,
        warmUp: 0,
        amostra: amostraMinima,
        ...deps,
      }),
    /operação|c9/i,
  );
});

test("SER-08 páginas do catálogo não importam a série", () => {
  const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const filmePage = readFileSync(
    new URL("../app/filme/[id]/page.tsx", import.meta.url),
    "utf8",
  );
  assert.equal(page.includes("serie-experimento"), false);
  assert.equal(filmePage.includes("serie-experimento"), false);
});

test("SER-09 matriz padrão C1–C4 × A / B-cold / B-warm com linhas tabulares", async () => {
  const armazenamento = memoriaArmazenamento();
  const executarHarness = async () => ({
    valor: {},
    latenciaMs: 2,
    acerto: null,
  });

  const resultado = await executarSerieExperimento({
    n: 2,
    warmUp: 0,
    amostra: amostraMinima,
    executarHarness,
    flush: async () => {},
    ...depsMinimas(armazenamento),
  });

  assert.equal(resultado.celulas.length, 12);
  for (const op of ["C1", "C2", "C3", "C4"]) {
    for (const cen of ["A", "B-cold", "B-warm"]) {
      assert.ok(
        resultado.celulas.some((c) => c.operacao === op && c.cenario === cen),
      );
    }
  }
  assert.equal(resultado.linhas.length, 12);
  const primeira = resultado.linhas[0];
  assert.ok("operacao" in primeira);
  assert.ok("cenario" in primeira);
  assert.ok("latenciaMedia" in primeira);
  assert.ok("mediana" in primeira);
  assert.ok("p95" in primeira);
  assert.ok("throughput" in primeira);
});

test("SER-10 cada medição delega ao harness injetável com cenário A ou B", async () => {
  const armazenamento = memoriaArmazenamento();
  const vistos = [];
  const executarHarness = async (opcoes) => {
    vistos.push({ operacao: opcoes.operacao, cenario: opcoes.cenario });
    return { valor: {}, latenciaMs: 1, acerto: null };
  };

  await executarSerieExperimento({
    operacoes: ["C1", "C3"],
    cenarios: ["A", "B-cold"],
    n: 1,
    warmUp: 0,
    amostra: amostraMinima,
    executarHarness,
    flush: async () => {},
    ...depsMinimas(armazenamento),
  });

  assert.deepEqual(vistos.filter((v) => v.operacao === "C1" && v.cenario === "A"), [
    { operacao: "C1", cenario: "A" },
  ]);
  assert.deepEqual(
    vistos.filter((v) => v.operacao === "C1" && v.cenario === "B"),
    [{ operacao: "C1", cenario: "B" }],
  );
});

test("SER-11 no máximo concorrencia medições in-flight na fase amostrada", async () => {
  const armazenamento = memoriaArmazenamento();
  let emVoo = 0;
  let maxEmVoo = 0;
  let indice = 0;
  const executarHarness = async () => {
    emVoo += 1;
    maxEmVoo = Math.max(maxEmVoo, emVoo);
    await new Promise((resolve) => setTimeout(resolve, 5));
    emVoo -= 1;
    indice += 1;
    return { valor: {}, latenciaMs: indice, acerto: null };
  };

  await executarSerieExperimento({
    operacoes: ["C4"],
    cenarios: ["A"],
    n: 12,
    warmUp: 2,
    concorrencia: 5,
    amostra: amostraMinima,
    executarHarness,
    ...depsMinimas(armazenamento),
  });

  assert.ok(maxEmVoo <= 5);
  assert.ok(maxEmVoo >= 5);
});

test("SER-12 concorrência 10 aceita; valores fora de 1/5/10 falham", async () => {
  const deps = { ...depsMinimas(memoriaArmazenamento()), flush: async () => {} };
  await assert.rejects(
    () =>
      executarSerieExperimento({
        concorrencia: 3,
        n: 1,
        warmUp: 0,
        amostra: amostraMinima,
        ...deps,
      }),
    /concorr/i,
  );
  await executarSerieExperimento({
    operacoes: ["C1"],
    cenarios: ["A"],
    n: 1,
    warmUp: 0,
    concorrencia: 10,
    amostra: amostraMinima,
    executarHarness: async () => ({ valor: {}, latenciaMs: 1, acerto: null }),
    ...deps,
  });
});

test("SER-13 células e linhas rotulam o nível de concorrência", async () => {
  const armazenamento = memoriaArmazenamento();
  const executarHarness = async () => ({
    valor: {},
    latenciaMs: 1,
    acerto: null,
  });

  const resultado = await executarSerieExperimento({
    operacoes: ["C1"],
    cenarios: ["A"],
    n: 2,
    warmUp: 0,
    concorrencia: 5,
    amostra: amostraMinima,
    executarHarness,
    ...depsMinimas(armazenamento),
  });

  assert.equal(resultado.celulas[0].concorrencia, 5);
  assert.equal(resultado.linhasTodas[0].concorrencia, 5);
  assert.equal(resultado.linhas.length, 0);
});

test("SER-14 níveis 1/5/10 isolam células; §10.1 principal = concorrência 1", async () => {
  const armazenamento = memoriaArmazenamento();
  const executarHarness = async () => ({
    valor: {},
    latenciaMs: 1,
    acerto: null,
  });

  const resultado = await executarSerieExperimento({
    n: 1,
    warmUp: 0,
    niveisConcorrencia: [1, 5, 10],
    amostra: amostraMinima,
    executarHarness,
    flush: async () => {},
    ...depsMinimas(armazenamento),
  });

  assert.equal(resultado.celulas.length, 36);
  const porNivel = new Set(resultado.celulas.map((c) => c.concorrencia));
  assert.deepEqual([...porNivel].sort((a, b) => a - b), [1, 5, 10]);
  assert.equal(resultado.linhas.length, 12);
  assert.ok(resultado.linhas.every((l) => l.concorrencia === 1));
  assert.equal(resultado.linhasTodas.length, 36);
});

test("SER-15 concorrência preserva flush B-cold e descarte de warm-up", async () => {
  const armazenamento = memoriaArmazenamento();
  const flushRegistro = [];
  const flush = async (ctx) => {
    flushRegistro.push(ctx);
  };
  let chamadas = 0;
  const latencias = [800, 800, 10, 20, 30];
  const executarHarness = async () => {
    const latenciaMs = latencias[chamadas] ?? 30;
    chamadas += 1;
    return { valor: {}, latenciaMs, acerto: false };
  };

  const resultado = await executarSerieExperimento({
    ...depsMinimas(armazenamento),
    operacoes: ["C2"],
    cenarios: ["B-cold"],
    n: 3,
    warmUp: 2,
    concorrencia: 5,
    amostra: amostraMinima,
    executarHarness,
    flush,
  });

  assert.equal(flushRegistro.length, 1);
  const celula = resultado.celulas[0];
  assert.equal(celula.latenciaMedia, 20);
  assert.equal(chamadas, 5);
});

test("SER-16 warm-up completo antes da primeira amostra com concorrência 10", async () => {
  const armazenamento = memoriaArmazenamento();
  const warmUp = 5;
  const n = 3;
  let proxima = 0;
  const inicios = [];
  const fins = [];

  const executarHarness = async () => {
    const id = proxima;
    proxima += 1;
    inicios.push({ id, t: performance.now() });
    const emWarmUp = id < warmUp;
    await new Promise((resolve) => setTimeout(resolve, emWarmUp ? 25 : 1));
    fins.push({ id, t: performance.now() });
    return {
      valor: {},
      latenciaMs: emWarmUp ? 900 : 10 + id,
      acerto: null,
    };
  };

  await executarSerieExperimento({
    operacoes: ["C1"],
    cenarios: ["A"],
    n,
    warmUp,
    concorrencia: 10,
    amostra: amostraMinima,
    executarHarness,
    ...depsMinimas(armazenamento),
  });

  const fimWarmUp = Math.max(
    ...fins.filter((e) => e.id < warmUp).map((e) => e.t),
  );
  for (const e of inicios.filter((x) => x.id >= warmUp && x.id < warmUp + n)) {
    assert.ok(
      e.t >= fimWarmUp,
      `amostra id=${e.id} iniciou antes do warm-up terminar`,
    );
  }
});