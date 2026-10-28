import { formatarDuracao, urlDoPoster } from "./cartaz.mjs";

export const vetorSql =
  "to_tsvector('portuguese', titulo || ' ' || titulo_original || ' ' || sinopse)";

export function textoDaBusca(bruto) {
  const cortado = String(bruto ?? "").slice(0, 80);
  return cortado
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/ +/g, " ");
}

export function tsqueryDaBusca(texto) {
  const termos = String(texto ?? "")
    .split(" ")
    .filter(Boolean);
  if (termos.length === 0) return "";
  return termos
    .map((termo, indice) => (indice === termos.length - 1 ? `${termo}:*` : termo))
    .join(" & ");
}

export function fichaDaBusca(linha) {
  const backdrop = linha.backdrop_path || linha.backdropPath || "";
  const poster = linha.poster_path || linha.posterPath || "";
  let banner = null;
  if (backdrop) banner = urlDoPoster(backdrop, "w780");
  else if (poster) banner = urlDoPoster(poster, "w500");

  const generoBruto = typeof linha.genero === "string" ? linha.genero.trim() : "";
  const minutos = Number(linha.duracao_min ?? linha.duracaoMin);
  const duracao = Number.isFinite(minutos) && minutos > 0 ? formatarDuracao(minutos) : null;

  return {
    id: Number(linha.id),
    titulo: String(linha.titulo ?? ""),
    genero: generoBruto || null,
    duracao,
    banner,
  };
}

/**
 * @param {number} pagina
 * @param {number} paginas
 * @returns {Array<number | "…">}
 */
export function numerosDePagina(pagina, paginas) {
  const total = Number(paginas);
  if (!Number.isInteger(total) || total < 1) return [];
  const numero = Number(pagina);
  const atual = Number.isInteger(numero) && numero > 0 ? Math.min(numero, total) : 1;
  if (total <= 7) return Array.from({ length: total }, (_, indice) => indice + 1);

  const visiveis = new Set([1, total, atual]);
  if (atual > 2) visiveis.add(atual - 1);
  if (atual < total - 1) visiveis.add(atual + 1);
  const ordenados = [...visiveis].sort((a, b) => a - b);
  /** @type {Array<number | "…">} */
  const itens = [];
  for (let indice = 0; indice < ordenados.length; indice += 1) {
    const valor = ordenados[indice];
    if (indice > 0 && valor - ordenados[indice - 1] > 1) itens.push("…");
    itens.push(valor);
  }
  return itens;
}

export function recorte(total, pagina, tamanho) {
  const limite = tamanho === 5 || tamanho === 10 ? tamanho : 5;
  const quantidade = Number(total);
  const seguros = Number.isFinite(quantidade) ? Math.max(0, Math.floor(quantidade)) : 0;
  const numero = Number(pagina);
  const pedida = Number.isInteger(numero) && numero > 0 ? numero : 1;
  const paginas = seguros === 0 ? 0 : Math.ceil(seguros / limite);
  const paginaCortada = paginas === 0 ? 1 : Math.min(pedida, paginas);
  return {
    pagina: paginaCortada,
    paginas,
    offset: (paginaCortada - 1) * limite,
    tamanho: limite,
  };
}

export async function executarBusca(executor, { texto, pagina, tamanho }) {
  const consulta = tsqueryDaBusca(textoDaBusca(texto));
  if (!consulta) {
    return { estado: "vazio", filmes: [], total: 0, pagina: 1, paginas: 0 };
  }

  const contagem = await executor(
    `SELECT count(*)::int AS total
     FROM filmes
     WHERE ${vetorSql} @@ to_tsquery('portuguese', $1)`,
    [consulta],
  );
  const total = Number(contagem[0]?.total ?? 0);
  const corte = recorte(total, pagina, tamanho);
  if (total === 0) {
    return { estado: "nenhum", filmes: [], total: 0, pagina: corte.pagina, paginas: 0 };
  }

  const linhas = await executor(
    `SELECT f.id, f.titulo, f.duracao_min, f.poster_path, f.backdrop_path,
        (
          SELECT g.nome
          FROM filme_generos fg
          JOIN generos g ON g.id = fg.genero_id
          WHERE fg.filme_id = f.id
          ORDER BY g.id ASC
          LIMIT 1
        ) AS genero
     FROM filmes f
     WHERE ${vetorSql} @@ to_tsquery('portuguese', $1)
     ORDER BY ts_rank(${vetorSql}, to_tsquery('portuguese', $1)) DESC, f.id ASC
     LIMIT $2 OFFSET $3`,
    [consulta, corte.tamanho, corte.offset],
  );

  return {
    estado: "ok",
    filmes: linhas.map(fichaDaBusca),
    total,
    pagina: corte.pagina,
    paginas: corte.paginas,
  };
}
