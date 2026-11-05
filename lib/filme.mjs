import { urlDoPoster } from "./cartaz.mjs";

function caminhoDeImagem(path, tamanho = "w1280") {
  if (typeof path !== "string" || path === "") return null;
  return urlDoPoster(path, tamanho);
}

export function fichaDoFilme(linha) {
  const titulo = typeof linha?.titulo === "string" ? linha.titulo : "";
  return {
    titulo,
    fundo: caminhoDeImagem(linha?.backdropPath) ?? caminhoDeImagem(linha?.posterPath),
    poster: caminhoDeImagem(linha?.posterPath, "w500"),
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
