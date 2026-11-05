import { urlDoPoster } from "./cartaz.mjs";

function caminhoDeImagem(path) {
  if (typeof path !== "string" || path === "") return null;
  return urlDoPoster(path, "w1280");
}

export function fichaDoFilme(linha) {
  const titulo = typeof linha?.titulo === "string" ? linha.titulo : "";
  return {
    titulo,
    fundo: caminhoDeImagem(linha?.backdropPath) ?? caminhoDeImagem(linha?.posterPath),
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
