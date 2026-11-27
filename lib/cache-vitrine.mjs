import { recuperarComCache } from "./recuperar-com-cache.mjs";

/** TTL em segundos para a vitrine da home (listas mudam com mais frequência que a ficha). */
export const TTL_VITRINE_SEGUNDOS = 120;

export const CHAVE_VITRINE_HOME = "vitrine:home";

/**
 * @param {{
 *   carregar: () => Promise<unknown> | unknown;
 *   armazenamento: import("./recuperar-com-cache.mjs").ArmazenamentoCache;
 * }} opcoes
 */
export async function recuperarVitrine({ carregar, armazenamento }) {
  return recuperarComCache({
    chave: CHAVE_VITRINE_HOME,
    ttlSegundos: TTL_VITRINE_SEGUNDOS,
    carregar,
    armazenamento,
  });
}
