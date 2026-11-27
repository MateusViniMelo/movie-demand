/**
 * CLI de coleta local do experimento Redis — parsing, amostra e formatação §10.1.
 */

/** @typedef {'A' | 'B-cold' | 'B-warm'} CenarioSerie */

export const PROTOCOLO_COLETA_PADRAO = {
  n: 50,
  warmUp: 5,
  concorrencia: 1,
};

/** Amostra fixa alinhada ao seed TMDB (`data/tmdb`). */
export const AMOSTRA_COLETA_PADRAO = {
  filmeId: 969681,
  generoId: 12,
  pagina: 1,
  tamanho: 10,
};

/**
 * @param {string[]} argv
 */
export function parseArgumentosColeta(argv) {
  /** @type {Record<string, string | boolean>} */
  const flags = {};
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (!token.startsWith("--")) continue;
    const chave = token.slice(2);
    const proximo = args[i + 1];
    if (!proximo || proximo.startsWith("--")) {
      flags[chave] = true;
      continue;
    }
    flags[chave] = proximo;
    i += 1;
  }

  const n = inteiroOu(flags.n, PROTOCOLO_COLETA_PADRAO.n);
  const warmUp = inteiroOu(
    flags["warm-up"] ?? flags.warmUp,
    PROTOCOLO_COLETA_PADRAO.warmUp,
  );
  const concorrencia = inteiroOu(
    flags.concorrencia,
    PROTOCOLO_COLETA_PADRAO.concorrencia,
  );

  const amostra = {
    filmeId: inteiroOu(flags["filme-id"] ?? flags.filmeId, AMOSTRA_COLETA_PADRAO.filmeId),
    generoId: inteiroOu(
      flags["genero-id"] ?? flags.generoId,
      AMOSTRA_COLETA_PADRAO.generoId,
    ),
    pagina: inteiroOu(flags.pagina, AMOSTRA_COLETA_PADRAO.pagina),
    tamanho: inteiroOu(flags.tamanho, AMOSTRA_COLETA_PADRAO.tamanho),
  };

  return { n, warmUp, concorrencia, amostra };
}

/**
 * @param {unknown} valor
 * @param {number} padrao
 */
function inteiroOu(valor, padrao) {
  if (valor === undefined || valor === true) {
    return padrao;
  }
  const n = Number.parseInt(String(valor), 10);
  if (!Number.isFinite(n)) {
    throw new Error(`Valor inteiro inválido: ${valor}`);
  }
  return n;
}

/**
 * @param {CenarioSerie | string} cenario
 */
export function rotuloCenarioSecao10(cenario) {
  if (cenario === "A") return "PostgreSQL";
  if (cenario === "B-cold") return "Redis (cache vazio)";
  if (cenario === "B-warm") return "Redis (cache quente)";
  return String(cenario);
}

/**
 * @param {number | undefined} valor
 * @param {number} [casas]
 */
function formatarMetrica(valor, casas = 2) {
  if (valor === undefined || !Number.isFinite(valor)) {
    return "—";
  }
  return valor.toFixed(casas);
}

/**
 * @param {{ linhas: object[]; linhasTodas: Array<{ concorrencia?: number } & object> }} resultado
 * @param {number} concorrencia
 */
export function selecionarLinhasSecao10(resultado, concorrencia) {
  if (resultado.linhas.length > 0) {
    return resultado.linhas;
  }
  return resultado.linhasTodas.filter((l) => l.concorrencia === concorrencia);
}

/**
 * @param {Array<{
 *   operacao: string;
 *   cenario: string;
 *   latenciaMedia: number;
 *   mediana: number;
 *   p95: number;
 *   throughput: number;
 *   hitRate?: number;
 *   reducaoPercentual?: number;
 * }>} linhas
 */
export function formatarTabelaSecao10(linhas) {
  const cabecalho =
    "| Operação | Cenário | Latência média | Mediana | P95 | Throughput |";
  const separador =
    "| -------- | ------- | -------------: | ------: | --: | ---------: |";

  const corpo = linhas.map((linha) => {
    const cen = rotuloCenarioSecao10(linha.cenario);
    return `| ${linha.operacao} | ${cen} | ${formatarMetrica(linha.latenciaMedia)} | ${formatarMetrica(linha.mediana)} | ${formatarMetrica(linha.p95)} | ${formatarMetrica(linha.throughput)} |`;
  });

  const hitRates = linhas
    .filter((l) => l.hitRate !== undefined && l.cenario !== "A")
    .map((l) => `Hit rate (B): ${l.operacao} ${l.cenario} ${formatarMetrica(l.hitRate)}%`);

  const reducoes = linhas
    .filter((l) => l.reducaoPercentual !== undefined)
    .map(
      (l) =>
        `Redução (B-warm vs A): ${l.operacao} ${formatarMetrica(l.reducaoPercentual)}%`,
    );

  return [cabecalho, separador, ...corpo, "", ...hitRates, ...reducoes].join("\n");
}

/**
 * @param {import("pg").Client} client
 * @param {{ filmeId: number; generoId: number; pagina?: number; tamanho?: number }} amostra
 */
export async function resolverAmostraColeta(client, amostra) {
  const filme = await client.query("SELECT id FROM filmes WHERE id = $1", [
    amostra.filmeId,
  ]);
  if (filme.rowCount === 0) {
    throw new Error(`Filme ${amostra.filmeId} ausente no banco — rode npm run db:seed`);
  }

  const genero = await client.query("SELECT id FROM generos WHERE id = $1", [
    amostra.generoId,
  ]);
  if (genero.rowCount === 0) {
    throw new Error(`Gênero ${amostra.generoId} ausente no banco`);
  }

  const listas = await client.query("SELECT COUNT(*)::int AS total FROM lista_filmes");
  if (listas.rows[0].total < 1) {
    throw new Error("Tabela lista_filmes vazia — vitrine C4 indisponível");
  }

  return {
    filmeId: amostra.filmeId,
    generoId: amostra.generoId,
    pagina: amostra.pagina ?? 1,
    tamanho: amostra.tamanho ?? 10,
  };
}