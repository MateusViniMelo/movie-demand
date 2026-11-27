import { recuperarFilmeComCache } from "./cache-ficha.mjs";
import { recuperarFilmesPorGeneroComCache } from "./cache-genero.mjs";
import { recuperarVitrine } from "./cache-vitrine.mjs";

/**
 * Harness de medição do experimento Redis (operações C1–C4).
 *
 * Contrato público:
 * - Operações: `C1` (ficha), `C2` (ficha com elenco — mesmo loader),
 *   `C3` (listagem por gênero paginada), `C4` (vitrine/home).
 * - Cenário A: só carregador / PostgreSQL; sem ler nem gravar cache;
 *   `acerto` = `null`. Cenário B: cache-aside da app; `acerto` = hit/miss.
 * - Entrada: `operacao`, `cenario`, params (`filmeId` para C1/C2;
 *   `generoIds`|`generoId`, `pagina`, `tamanho` para C3) e carregadores /
 *   armazenamento injetáveis.
 * - Saída: `{ valor, latenciaMs, acerto }` — `latenciaMs` ≥ 0;
 *   `acerto` é `true`|`false` no B e `null` (N/A) no A.
 *
 * C1/C2 → `recuperarFilmeComCache`; C3 → `recuperarFilmesPorGeneroComCache`;
 * C4 → `recuperarVitrine`.
 */

/**
 * @typedef {'C1' | 'C2' | 'C3' | 'C4'} OperacaoExperimento
 * @typedef {'A' | 'B'} CenarioExperimento
 */

/**
 * @param {{
 *   operacao: OperacaoExperimento;
 *   cenario: CenarioExperimento;
 *   filmeId?: number;
 *   generoId?: unknown;
 *   generoIds?: unknown;
 *   pagina?: unknown;
 *   tamanho?: unknown;
 *   carregarFilme?: (id: number) => Promise<unknown> | unknown;
 *   carregarFilmesPorGenero?: (entrada: {
 *     generoId?: unknown;
 *     generoIds?: unknown;
 *     pagina?: unknown;
 *     tamanho?: unknown;
 *   }) => Promise<unknown> | unknown;
 *   carregarVitrine?: () => Promise<unknown> | unknown;
 *   armazenamento?: import("./recuperar-com-cache.mjs").ArmazenamentoCache;
 * }} opcoes
 * @returns {Promise<{ valor: unknown; latenciaMs: number; acerto: boolean | null }>}
 */
export async function executarHarnessExperimento({
  operacao,
  cenario,
  filmeId,
  generoId,
  generoIds,
  pagina,
  tamanho,
  carregarFilme,
  carregarFilmesPorGenero,
  carregarVitrine,
  armazenamento,
}) {
  if (
    operacao !== "C1" &&
    operacao !== "C2" &&
    operacao !== "C3" &&
    operacao !== "C4"
  ) {
    throw new Error(`Operação desconhecida: ${operacao}`);
  }
  if (cenario !== "A" && cenario !== "B") {
    throw new Error(`Cenário desconhecido: ${cenario}`);
  }

  const inicio = performance.now();

  if (operacao === "C3") {
    if (typeof carregarFilmesPorGenero !== "function") {
      throw new Error("carregarFilmesPorGenero é obrigatório para C3");
    }

    const entrada = { generoId, generoIds, pagina, tamanho };

    if (cenario === "A") {
      const valor = await carregarFilmesPorGenero(entrada);
      return {
        valor,
        latenciaMs: performance.now() - inicio,
        acerto: null,
      };
    }

    if (!armazenamento) {
      throw new Error("armazenamento é obrigatório no cenário B");
    }

    const { valor, acerto } = await recuperarFilmesPorGeneroComCache({
      ...entrada,
      carregar: () => carregarFilmesPorGenero(entrada),
      armazenamento,
    });
    return {
      valor,
      latenciaMs: performance.now() - inicio,
      acerto,
    };
  }

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
