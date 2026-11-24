import { formatarDuracao, urlDoPoster } from "./cartaz.mjs";

function caminhoDeImagem(path, tamanho = "w1280") {
  if (typeof path !== "string" || path === "") return null;
  return urlDoPoster(path, tamanho);
}

function anoDaFicha(dataLancamento) {
  if (dataLancamento == null || dataLancamento === "") return null;
  const data = dataLancamento instanceof Date ? dataLancamento : new Date(dataLancamento);
  if (Number.isNaN(data.getTime())) return null;
  const ano = data.getUTCFullYear();
  if (!Number.isFinite(ano) || ano < 1000 || ano > 9999) return null;
  return String(ano);
}

function generosDaFicha(generos) {
  if (!Array.isArray(generos)) return [];
  const nomes = [];
  for (const item of generos) {
    const nome = typeof item?.genero?.nome === "string" ? item.genero.nome.trim() : "";
    if (nome) nomes.push(nome);
  }
  return nomes;
}

function notaDaFicha(linha) {
  const votos = Number(linha?.votos);
  const nota = Number(linha?.notaMedia);
  if (!(votos > 0) || !Number.isFinite(nota)) return null;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(nota);
}

function metaDaFicha(linha) {
  const partes = [];
  const ano = anoDaFicha(linha?.dataLancamento);
  if (ano) partes.push(ano);

  const minutos = Number(linha?.duracaoMin);
  if (Number.isFinite(minutos) && minutos > 0) {
    partes.push(formatarDuracao(minutos));
  }

  partes.push(...generosDaFicha(linha?.generos));

  const nota = notaDaFicha(linha);
  if (nota) partes.push(nota);

  return partes.join(" · ");
}

function trailerDaFicha(linha) {
  const url = typeof linha?.trailerUrl === "string" ? linha.trailerUrl.trim() : "";
  return url || null;
}

function idDoYoutube(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
    return /^[\w-]{6,}$/.test(id) ? id : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (parsed.pathname.startsWith("/embed/")) {
      const id = parsed.pathname.split("/")[2] ?? "";
      return /^[\w-]{6,}$/.test(id) ? id : null;
    }
    const id = parsed.searchParams.get("v") ?? "";
    return /^[\w-]{6,}$/.test(id) ? id : null;
  }
  return null;
}

function trailerEmbedDaFicha(linha) {
  const url = trailerDaFicha(linha);
  if (!url) return null;
  const id = idDoYoutube(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

const ELENCO_PRINCIPAL = 8;

function elencoDaFicha(elencos) {
  if (!Array.isArray(elencos)) return [];
  const itens = [];
  for (const item of elencos) {
    const nome = typeof item?.pessoa?.nome === "string" ? item.pessoa.nome.trim() : "";
    if (!nome) continue;
    const personagem = typeof item?.personagem === "string" ? item.personagem.trim() : "";
    const ordem = Number(item?.ordem);
    const pessoaId = Number(item?.pessoaId);
    itens.push({
      nome,
      personagem,
      ordem: Number.isFinite(ordem) ? ordem : Number.POSITIVE_INFINITY,
      pessoaId: Number.isFinite(pessoaId) ? pessoaId : Number.POSITIVE_INFINITY,
    });
  }
  itens.sort((a, b) => {
    if (a.ordem !== b.ordem) return a.ordem - b.ordem;
    return a.pessoaId - b.pessoaId;
  });
  return itens.slice(0, ELENCO_PRINCIPAL).map(({ pessoaId, nome, personagem }) => ({
    pessoaId,
    nome,
    personagem,
  }));
}

export function fichaDoFilme(linha) {
  const titulo = typeof linha?.titulo === "string" ? linha.titulo : "";
  const sinopse = typeof linha?.sinopse === "string" ? linha.sinopse.trim() : "";
  return {
    titulo,
    fundo: caminhoDeImagem(linha?.backdropPath) ?? caminhoDeImagem(linha?.posterPath),
    poster: caminhoDeImagem(linha?.posterPath, "w500"),
    meta: metaDaFicha(linha),
    sinopse,
    trailerUrl: trailerDaFicha(linha),
    trailerEmbed: trailerEmbedDaFicha(linha),
    elenco: elencoDaFicha(linha?.elencos),
  };
}

const ID_MAX = 2147483647;

export function idDoFilme(bruto) {
  if (typeof bruto !== "string" || !/^[1-9]\d*$/.test(bruto)) return null;
  const id = Number(bruto);
  if (!Number.isSafeInteger(id) || id > ID_MAX) return null;
  return id;
}

export function caminhoDoFilme(id) {
  return `/filme/${id}`;
}
