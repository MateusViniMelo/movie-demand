import { urlDoPoster } from "./cartaz.mjs";
import { idDoFilme } from "./filme.mjs";

export const CHAVE_RECOMENDACAO = "cineverso.recomendacao";

const COLECAO = 0.3;
const ELENCO = 0.15;
const LIMITE = 12;
const FILEIRAS = new Set(["Novidades", "Mais bem avaliados", "Filmes em Cartaz"]);

export function gravaEscolha(titulo) {
  return FILEIRAS.has(titulo);
}

export function registrarClique(armazenamento, filmeId) {
  try {
    armazenamento.setItem(CHAVE_RECOMENDACAO, JSON.stringify({ versao: 1, filmeId }));
  } catch {
    return;
  }
}

export function lerRecomendacao(bruto) {
  if (typeof bruto !== "string") return null;
  let dados;
  try {
    dados = JSON.parse(bruto);
  } catch {
    return null;
  }
  if (!dados || typeof dados !== "object" || dados.versao !== 1) return null;
  if (typeof dados.filmeId !== "number" || !Number.isSafeInteger(dados.filmeId)) return null;
  return idDoFilme(String(dados.filmeId));
}

export function lerArmazenamento(armazenamento) {
  try {
    return lerRecomendacao(armazenamento.getItem(CHAVE_RECOMENDACAO));
  } catch {
    return null;
  }
}

export function pedidoDaRecomendacao(filmeId) {
  return `/api/recomendacoes?filme=${filmeId}`;
}

export function pedidoSeHouver(filmeId) {
  if (filmeId === null) return null;
  return pedidoDaRecomendacao(filmeId);
}

export function eventoAtualizaRecomendacao(chave) {
  return chave === CHAVE_RECOMENDACAO;
}

export function filmesDaResposta(status, corpo) {
  if (status !== 200 || !corpo || !Array.isArray(corpo.filmes)) return [];
  return corpo.filmes;
}

function conjuntoGeneros(generos) {
  const ids = [];
  const vistos = new Set();
  for (const id of generos ?? []) {
    if (!Number.isInteger(id) || vistos.has(id)) continue;
    vistos.add(id);
    ids.push(id);
  }
  return ids;
}

function cincoElenco(elenco) {
  const porPessoa = new Map();
  for (const item of elenco ?? []) {
    if (!Number.isInteger(item?.pessoaId) || !Number.isInteger(item?.ordem)) continue;
    const atual = porPessoa.get(item.pessoaId);
    if (atual === undefined || item.ordem < atual) porPessoa.set(item.pessoaId, item.ordem);
  }
  return [...porPessoa.entries()]
    .sort((a, b) => a[1] - b[1] || a[0] - b[0])
    .slice(0, 5)
    .map(([pessoaId]) => pessoaId);
}

function temPoster(filme) {
  return typeof filme?.posterPath === "string" && filme.posterPath !== "";
}

export function partesDaNota(origem, candidato) {
  const generosOrigem = conjuntoGeneros(origem?.generos);
  const generosCandidato = conjuntoGeneros(candidato?.generos);
  const daOrigem = new Set(generosOrigem);
  let genero = 0;
  if (generosOrigem.length > 0 && generosCandidato.length > 0) {
    const peso = 1 / generosOrigem.length;
    let soma = 0;
    for (const id of generosCandidato) {
      if (daOrigem.has(id)) soma += peso;
    }
    genero = soma / generosCandidato.length;
  }
  const mesmaColecao = origem?.colecaoId != null && origem.colecaoId === candidato?.colecaoId;
  const colecao = mesmaColecao ? COLECAO : 0;
  const nomes = new Set(cincoElenco(origem?.elenco));
  const elenco = cincoElenco(candidato?.elenco).some((id) => nomes.has(id)) ? ELENCO : 0;
  const nota = genero + colecao + elenco;
  return {
    genero,
    colecao,
    elenco,
    nota,
    entra: nota > 0 && (genero > 0 || mesmaColecao),
  };
}

export function recomendar(origem, filmes) {
  const escolhidos = [];
  for (const candidato of filmes ?? []) {
    if (candidato?.id === origem?.id || !temPoster(candidato)) continue;
    const partes = partesDaNota(origem, candidato);
    if (!partes.entra) continue;
    escolhidos.push({ filme: candidato, nota: partes.nota });
  }
  escolhidos.sort(
    (a, b) =>
      b.nota - a.nota ||
      b.filme.votos - a.filme.votos ||
      b.filme.notaMedia - a.filme.notaMedia ||
      a.filme.id - b.filme.id,
  );
  return escolhidos.slice(0, LIMITE).map((item) => item.filme);
}

export function cartazDaRecomendacao(filme) {
  return {
    id: filme.id,
    titulo: filme.titulo,
    src: urlDoPoster(filme.posterPath, "w500"),
  };
}

export function decidirRecomendacao(consulta, filmes) {
  const id = idDoFilme(typeof consulta === "string" ? consulta : "");
  if (id === null) return { status: 404, corpo: { filmes: [] } };
  const origem = (filmes ?? []).find((filme) => filme.id === id);
  if (!origem) return { status: 404, corpo: { filmes: [] } };
  return {
    status: 200,
    corpo: { filmes: recomendar(origem, filmes).map(cartazDaRecomendacao) },
  };
}

export async function atenderRecomendacao(consulta, lerFilmes) {
  try {
    return decidirRecomendacao(consulta, await lerFilmes());
  } catch {
    return { status: 500, corpo: { filmes: [] } };
  }
}

export function filmeDaLinha(linha) {
  return {
    id: linha.id,
    titulo: linha.titulo,
    posterPath: linha.posterPath,
    colecaoId: linha.colecaoId,
    votos: linha.votos,
    notaMedia: linha.notaMedia,
    generos: (linha.generos ?? []).map((item) => item.generoId),
    elenco: (linha.elencos ?? []).map((item) => ({
      pessoaId: item.pessoaId,
      ordem: item.ordem,
    })),
  };
}
