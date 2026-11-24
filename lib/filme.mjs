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

export function fichaDoFilme(linha) {
  const titulo = typeof linha?.titulo === "string" ? linha.titulo : "";
  return {
    titulo,
    fundo: caminhoDeImagem(linha?.backdropPath) ?? caminhoDeImagem(linha?.posterPath),
    poster: caminhoDeImagem(linha?.posterPath, "w500"),
    meta: metaDaFicha(linha),
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
