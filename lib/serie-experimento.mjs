import { executarHarnessExperimento } from "./harness-experimento.mjs";

/**
 * Série do experimento Redis (C1–C4 × A / B-cold / B-warm).
 *
 * Protocolo: N=50, warm-up=5, concorrência padrão 1 (níveis opcionais 1, 5, 10).
 * Warm-up descartado da amostra e do hit-rate. Flush injetável apenas antes de
 * cada célula B-cold. Throughput = N / T (req/s), T = tempo de parede das N
 * amostras pós warm-up. `linhas` = tabela §10.1 (somente concorrência 1).
 * P95: percentil 95 por nearest-rank — índice ceil(0,95×N)−1 em latências ordenadas.
 */

/** @typedef {'C1' | 'C2' | 'C3' | 'C4'} OperacaoSerie */
/** @typedef {'A' | 'B-cold' | 'B-warm'} CenarioSerie */

const OPERACOES_PADRAO = /** @type {OperacaoSerie[]} */ (["C1", "C2", "C3", "C4"]);
const CENARIOS_PADRAO = /** @type {CenarioSerie[]} */ (["A", "B-cold", "B-warm"]);
const N_PADRAO = 50;
const WARM_UP_PADRAO = 5;
const CONCORRENCIA_PADRAO = 1;
const CONCORRENCIAS_VALIDAS = /** @type {const} */ ([1, 5, 10]);

/**
 * @param {number[]} valores
 * @returns {number}
 */
function media(valores) {
  if (valores.length === 0) {
    return 0;
  }
  return valores.reduce((s, v) => s + v, 0) / valores.length;
}

/**
 * @param {number[]} valores
 * @returns {number}
 */
function mediana(valores) {
  if (valores.length === 0) {
    return 0;
  }
  const sorted = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[meio];
  }
  return (sorted[meio - 1] + sorted[meio]) / 2;
}

/**
 * Nearest-rank: índice ceil(0,95×N)−1 (base 0).
 * @param {number[]} valores
 * @returns {number}
 */
function percentil95(valores) {
  if (valores.length === 0) {
    return 0;
  }
  const sorted = [...valores].sort((a, b) => a - b);
  const idx = Math.ceil(0.95 * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

/**
 * @param {boolean | null} acerto
 * @returns {boolean}
 */
function contabilizaHit(acerto) {
  return acerto === true;
}

/**
 * @param {CenarioSerie} cenarioSerie
 * @returns {'A' | 'B'}
 */
function cenarioHarness(cenarioSerie) {
  return cenarioSerie === "A" ? "A" : "B";
}

/**
 * @param {number} concorrencia
 */
function assertConcorrenciaValida(concorrencia) {
  if (!CONCORRENCIAS_VALIDAS.includes(/** @type {1 | 5 | 10} */ (concorrencia))) {
    throw new Error("concorrência deve ser 1, 5 ou 10");
  }
}

/**
 * @param {{
 *   concorrencia: number;
 *   warmUp: number;
 *   n: number;
 *   operacao: OperacaoSerie;
 *   cenario: CenarioSerie;
 *   amostra: object;
 *   armazenamento?: import("./recuperar-com-cache.mjs").ArmazenamentoCache;
 *   carregarFilme?: (id: number) => Promise<unknown> | unknown;
 *   carregarFilmesPorGenero?: (entrada: object) => Promise<unknown> | unknown;
 *   carregarVitrine?: () => Promise<unknown> | unknown;
 *   executarHarness: typeof executarHarnessExperimento;
 * }} params
 * @returns {Promise<{ latencias: number[]; acertosB: boolean[]; tempoAmostraMs: number }>}
 */
async function medirCelulaComConcorrencia({
  concorrencia,
  warmUp,
  n,
  operacao,
  cenario,
  amostra,
  armazenamento,
  carregarFilme,
  carregarFilmesPorGenero,
  carregarVitrine,
  executarHarness,
}) {
  const totalIteracoes = warmUp + n;
  const cenarioH = cenarioHarness(cenario);
  const latencias = [];
  const acertosB = [];
  let proximoIndice = 0;
  let inicioAmostra = 0;

  async function worker() {
    while (true) {
      const i = proximoIndice;
      proximoIndice += 1;
      if (i >= totalIteracoes) {
        break;
      }
      const emWarmUp = i < warmUp;
      if (!emWarmUp && inicioAmostra === 0) {
        inicioAmostra = performance.now();
      }

      const resultado = await executarHarness({
        operacao,
        cenario: cenarioH,
        filmeId: amostra.filmeId,
        generoId: amostra.generoId,
        generoIds: amostra.generoIds,
        pagina: amostra.pagina,
        tamanho: amostra.tamanho,
        carregarFilme,
        carregarFilmesPorGenero,
        carregarVitrine,
        armazenamento: cenarioH === "B" ? armazenamento : undefined,
      });

      if (!emWarmUp) {
        latencias.push(resultado.latenciaMs);
        if (cenarioH === "B") {
          acertosB.push(contabilizaHit(resultado.acerto));
        }
      }
    }
  }

  const paralelismo = Math.min(concorrencia, totalIteracoes);
  await Promise.all(Array.from({ length: paralelismo }, () => worker()));

  const tempoAmostraMs =
    inicioAmostra > 0 ? performance.now() - inicioAmostra : 0;

  return { latencias, acertosB, tempoAmostraMs };
}

/**
 * @param {{
 *   operacoes?: OperacaoSerie[];
 *   cenarios?: CenarioSerie[];
 *   n?: number;
 *   warmUp?: number;
 *   concorrencia?: number;
 *   niveisConcorrencia?: number[];
 *   amostra: {
 *     filmeId?: number;
 *     generoId?: unknown;
 *     generoIds?: unknown;
 *     pagina?: unknown;
 *     tamanho?: unknown;
 *   };
 *   armazenamento?: import("./recuperar-com-cache.mjs").ArmazenamentoCache;
 *   flush?: (ctx: { operacao: OperacaoSerie; cenario: CenarioSerie }) => Promise<void> | void;
 *   carregarFilme?: (id: number) => Promise<unknown> | unknown;
 *   carregarFilmesPorGenero?: (entrada: object) => Promise<unknown> | unknown;
 *   carregarVitrine?: () => Promise<unknown> | unknown;
 *   executarHarness?: typeof executarHarnessExperimento;
 * }} opcoes
 */
export async function executarSerieExperimento({
  operacoes = OPERACOES_PADRAO,
  cenarios = CENARIOS_PADRAO,
  n = N_PADRAO,
  warmUp = WARM_UP_PADRAO,
  concorrencia = CONCORRENCIA_PADRAO,
  niveisConcorrencia,
  amostra,
  armazenamento,
  flush,
  carregarFilme,
  carregarFilmesPorGenero,
  carregarVitrine,
  executarHarness = executarHarnessExperimento,
}) {
  const niveis =
    niveisConcorrencia === undefined ? [concorrencia] : niveisConcorrencia;

  validarParametros({
    operacoes,
    cenarios,
    n,
    warmUp,
    concorrencia,
    niveis,
    amostra,
    flush,
  });

  /** @type {import("./serie-experimento.mjs").CelulaSerie[]} */
  const celulas = [];

  for (const nivel of niveis) {
    for (const operacao of operacoes) {
      for (const cenario of cenarios) {
        if (cenario === "B-cold" && typeof flush === "function") {
          await flush({ operacao, cenario });
        }

        const { latencias, acertosB, tempoAmostraMs } =
          await medirCelulaComConcorrencia({
            concorrencia: nivel,
            warmUp,
            n,
            operacao,
            cenario,
            amostra,
            armazenamento,
            carregarFilme,
            carregarFilmesPorGenero,
            carregarVitrine,
            executarHarness,
          });

        const latenciaMedia = media(latencias);
        const med = mediana(latencias);
        const p95 = percentil95(latencias);
        const tempoSegundos = tempoAmostraMs / 1000;
        const throughput = tempoSegundos > 0 ? n / tempoSegundos : 0;

        /** @type {import("./serie-experimento.mjs").CelulaSerie} */
        const celula = {
          operacao,
          cenario,
          concorrencia: nivel,
          latenciaMedia,
          mediana: med,
          p95,
          throughput,
          tempoAmostraMs,
        };

        if (cenario !== "A" && acertosB.length > 0) {
          const hits = acertosB.filter(Boolean).length;
          celula.hitRate = (hits / acertosB.length) * 100;
        }

        celulas.push(celula);
      }
    }
  }

  for (const nivel of niveis) {
    for (const operacao of operacoes) {
      const a = celulas.find(
        (c) =>
          c.operacao === operacao &&
          c.cenario === "A" &&
          c.concorrencia === nivel,
      );
      const warm = celulas.find(
        (c) =>
          c.operacao === operacao &&
          c.cenario === "B-warm" &&
          c.concorrencia === nivel,
      );
      if (a && warm && a.latenciaMedia > 0) {
        warm.reducaoPercentual =
          ((a.latenciaMedia - warm.latenciaMedia) / a.latenciaMedia) * 100;
      }
    }
  }

  const linhasTodas = celulas.map((c) => ({
    operacao: c.operacao,
    cenario: c.cenario,
    concorrencia: c.concorrencia,
    latenciaMedia: c.latenciaMedia,
    mediana: c.mediana,
    p95: c.p95,
    throughput: c.throughput,
    ...(c.hitRate !== undefined ? { hitRate: c.hitRate } : {}),
    ...(c.reducaoPercentual !== undefined
      ? { reducaoPercentual: c.reducaoPercentual }
      : {}),
  }));

  const linhas = linhasTodas.filter((l) => l.concorrencia === 1);

  return { celulas, linhas, linhasTodas };
}

/**
 * @param {{
 *   operacoes: OperacaoSerie[];
 *   cenarios: CenarioSerie[];
 *   n: number;
 *   warmUp: number;
 *   concorrencia: number;
 *   niveis: number[];
 *   amostra: object;
 *   flush?: (ctx: { operacao: OperacaoSerie; cenario: CenarioSerie }) => Promise<void> | void;
 * }} params
 */
function validarParametros({
  operacoes,
  cenarios,
  n,
  warmUp,
  concorrencia,
  niveis,
  amostra,
  flush,
}) {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error("n deve ser inteiro ≥ 1");
  }
  if (!Number.isInteger(warmUp) || warmUp < 0) {
    throw new Error("warmUp deve ser inteiro ≥ 0");
  }
  assertConcorrenciaValida(concorrencia);
  if (!Array.isArray(niveis) || niveis.length === 0) {
    throw new Error("níveis de concorrência inválidos");
  }
  for (const nivel of niveis) {
    assertConcorrenciaValida(nivel);
  }

  if (!amostra || typeof amostra !== "object") {
    throw new Error("amostra é obrigatória");
  }

  const opsValidas = new Set(["C1", "C2", "C3", "C4"]);
  for (const op of operacoes) {
    if (!opsValidas.has(op)) {
      throw new Error(`Operação desconhecida na série: ${op}`);
    }
  }

  const cenValidos = new Set(["A", "B-cold", "B-warm"]);
  for (const cen of cenarios) {
    if (!cenValidos.has(cen)) {
      throw new Error(`Cenário desconhecido na série: ${cen}`);
    }
  }

  const precisaB = cenarios.some((c) => c !== "A");
  if (precisaB && cenarios.includes("B-cold") && typeof flush !== "function") {
    throw new Error("flush injetável é obrigatório para cenários B-cold");
  }
}