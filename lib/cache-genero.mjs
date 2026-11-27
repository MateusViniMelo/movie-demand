import { idsDeGenero } from "./busca.mjs";
import { recuperarComCache } from "./recuperar-com-cache.mjs";

/**
 * Tempo de vida do cache da listagem por gênero, em segundos.
 * Listas mudam com mais frequência que a ficha; mesma ordem de grandeza da vitrine.
 */
export const TTL_GENERO_SEGUNDOS = 120;

/**
 * Chave estável: ids únicos ordenados + página + tamanho.
 * @param {{ generoId?: unknown; generoIds?: unknown; pagina?: unknown; tamanho?: unknown }} entrada
 * @returns {string}
 */
export function chaveCacheGenero(entrada) {
  const ids = idsDeGenero(entrada).slice().sort((a, b) => a - b);
  const pagina = Number(entrada?.pagina);
  const tamanho = Number(entrada?.tamanho);
  const paginaSegura = Number.isInteger(pagina) && pagina > 0 ? pagina : 1;
  const tamanhoSeguro = Number.isInteger(tamanho) && tamanho > 0 ? tamanho : 10;
  return `genero:${ids.join(",")}:p${paginaSegura}:s${tamanhoSeguro}`;
}

/**
 * @param {{
 *   generoId?: unknown;
 *   generoIds?: unknown;
 *   pagina?: unknown;
 *   tamanho?: unknown;
 *   carregar: () => Promise<unknown> | unknown;
 *   armazenamento: import("./recuperar-com-cache.mjs").ArmazenamentoCache;
 * }} opcoes
 */
export async function recuperarFilmesPorGeneroComCache({
  carregar,
  armazenamento,
  ...entrada
}) {
  return recuperarComCache({
    chave: chaveCacheGenero(entrada),
    ttlSegundos: TTL_GENERO_SEGUNDOS,
    carregar,
    armazenamento,
    podeGravar(valor) {
      return valor != null && /** @type {{ estado?: string }} */ (valor).estado !== "ausente";
    },
  });
}
