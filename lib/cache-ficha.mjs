import { recuperarComCache } from "./recuperar-com-cache.mjs";

/**
 * Tempo de vida do cache da ficha do filme (inclui elenco), em segundos.
 * Metadados de catálogo mudam com pouca frequência; 15 minutos equilibra frescor e hits.
 */
export const TTL_FICHA_SEGUNDOS = 900;

/**
 * @param {number} id
 * @returns {string}
 */
export function chaveCacheFilme(id) {
  return `filme:${id}`;
}

/**
 * @param {number} id
 * @param {{
 *   carregar: () => Promise<unknown> | unknown;
 *   armazenamento: import("./recuperar-com-cache.mjs").ArmazenamentoCache;
 * }} opcoes
 */
export async function recuperarFilmeComCache(id, { carregar, armazenamento }) {
  return recuperarComCache({
    chave: chaveCacheFilme(id),
    ttlSegundos: TTL_FICHA_SEGUNDOS,
    carregar,
    armazenamento,
    podeGravar(valor) {
      return valor != null;
    },
  });
}
