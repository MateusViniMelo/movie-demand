/**
 * @typedef {object} ArmazenamentoCache
 * @property {(chave: string) => Promise<string | null>} ler
 * @property {(chave: string, valor: string, ttlSegundos: number) => Promise<void>} gravar
 */

/**
 * @param {{
 *   chave: string;
 *   ttlSegundos: number;
 *   carregar: () => Promise<unknown> | unknown;
 *   armazenamento: ArmazenamentoCache;
 *   podeGravar?: (valor: unknown) => boolean;
 * }} opcoes
 * @returns {Promise<{ valor: unknown; acerto: boolean }>}
 */
export async function recuperarComCache({
  chave,
  ttlSegundos,
  carregar,
  armazenamento,
  podeGravar = () => true,
}) {
  let bruto = null;
  try {
    bruto = await armazenamento.ler(chave);
  } catch {
    bruto = null;
  }

  if (bruto != null && bruto !== "") {
    try {
      const valor = JSON.parse(bruto);
      return { valor, acerto: true };
    } catch {
      // JSON inválido: segue para o carregador
    }
  }

  const valor = await carregar();

  if (podeGravar(valor)) {
    try {
      await armazenamento.gravar(chave, JSON.stringify(valor), ttlSegundos);
    } catch {
      // escrita best-effort
    }
  }

  return { valor, acerto: false };
}