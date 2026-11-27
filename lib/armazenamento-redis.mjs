/** @typedef {import("redis").RedisClientType} ClienteRedis */

const PREFIXO_PADRAO = "movie-demand";

/**
 * @param {ClienteRedis | { isOpen: boolean; connect: () => Promise<void>; get: (chave: string) => Promise<string | null>; set: (chave: string, valor: string, opcoes: { EX: number }) => Promise<unknown> }} cliente
 * @param {{ prefixo?: string }} [opcoes]
 * @returns {import("./recuperar-com-cache.mjs").ArmazenamentoCache}
 */
export function criarArmazenamentoRedis(cliente, opcoes = {}) {
  const prefixo = opcoes.prefixo ?? PREFIXO_PADRAO;

  async function garantirConexao() {
    if (!cliente.isOpen) {
      await cliente.connect();
    }
  }

  function chaveComPrefixo(chave) {
    return `${prefixo}:${chave}`;
  }

  return {
    async ler(chave) {
      try {
        await garantirConexao();
        return await cliente.get(chaveComPrefixo(chave));
      } catch {
        return null;
      }
    },
    async gravar(chave, valor, ttlSegundos) {
      try {
        await garantirConexao();
        await cliente.set(chaveComPrefixo(chave), valor, { EX: ttlSegundos });
      } catch {
        // escrita best-effort
      }
    },
  };
}

/**
 * @param {ClienteRedis} cliente
 * @returns {import("./recuperar-com-cache.mjs").ArmazenamentoCache}
 */
export function armazenamentoCacheRedis(cliente) {
  return criarArmazenamentoRedis(cliente);
}