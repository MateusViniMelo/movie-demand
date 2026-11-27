import { recuperarFilmeComCache } from "./cache-ficha.mjs";
import { recuperarVitrine } from "./cache-vitrine.mjs";

/**
 * Harness de medição do experimento Redis (operações C1, C2 e C4).
 *
 * Entrada: operação (`C1`|`C2`|`C4`), cenário (`A`|`B`) e parâmetros
 * (ex.: `filmeId` para C1/C2). Carregadores e armazenamento são injetáveis.
 *
 * Saída: `{ valor, latenciaMs, acerto }` — `acerto` é `true` (hit), `false`
 * (miss) no cenário B, e `null` (N/A) no cenário A.
 *
 * Cenário A: só o carregador (PostgreSQL); não lê nem grava cache.
 * Cenário B: cache-aside da ficha (C1/C2) ou da vitrine (C4).
 * C1 e C2 usam o mesmo loader da ficha (detalhe com elenco).
 */

/**
 * @typedef {'C1' | 'C2' | 'C4'} OperacaoExperimento
 * @typedef {'A' | 'B'} CenarioExperimento
 */

/**
 * @param {{
 *   operacao: OperacaoExperimento;
 *   cenario: CenarioExperimento;
 *   filmeId?: number;
 *   carregarFilme?: (id: number) => Promise<unknown> | unknown;
 *   carregarVitrine?: () => Promise<unknown> | unknown;
 *   armazenamento?: import("./recuperar-com-cache.mjs").ArmazenamentoCache;
 * }} opcoes
 * @returns {Promise<{ valor: unknown; latenciaMs: number; acerto: boolean | null }>}
 */
export async function executarHarnessExperimento({
  operacao,
  cenario,
  filmeId,
  carregarFilme,
  carregarVitrine,
  armazenamento,
}) {
  if (operacao !== "C1" && operacao !== "C2" && operacao !== "C4") {
    throw new Error(`Operação desconhecida: ${operacao}`);
  }
  if (cenario !== "A" && cenario !== "B") {
    throw new Error(`Cenário desconhecido: ${cenario}`);
  }

  const inicio = performance.now();

  if (operacao === "C4") {
    if (typeof carregarVitrine !== "function") {
      throw new Error("carregarVitrine é obrigatório para C4");
    }

    if (cenario === "A") {
      const valor = await carregarVitrine();
      return {
        valor,
        latenciaMs: performance.now() - inicio,
        acerto: null,
      };
    }

    if (!armazenamento) {
      throw new Error("armazenamento é obrigatório no cenário B");
    }

    const { valor, acerto } = await recuperarVitrine({
      carregar: carregarVitrine,
      armazenamento,
    });
    return {
      valor,
      latenciaMs: performance.now() - inicio,
      acerto,
    };
  }

  // C1 e C2: mesmo loader da ficha (detalhe com relacionamentos/elenco)
  if (typeof filmeId !== "number" || !Number.isFinite(filmeId)) {
    throw new Error("filmeId numérico é obrigatório para C1/C2");
  }
  if (typeof carregarFilme !== "function") {
    throw new Error("carregarFilme é obrigatório para C1/C2");
  }

  if (cenario === "A") {
    const valor = await carregarFilme(filmeId);
    return {
      valor,
      latenciaMs: performance.now() - inicio,
      acerto: null,
    };
  }

  if (!armazenamento) {
    throw new Error("armazenamento é obrigatório no cenário B");
  }

  const { valor, acerto } = await recuperarFilmeComCache(filmeId, {
    carregar: () => carregarFilme(filmeId),
    armazenamento,
  });
  return {
    valor,
    latenciaMs: performance.now() - inicio,
    acerto,
  };
}
