import { urlDoPoster } from "./cartaz.mjs";

const TETO = 16;

export function autenticacaoTmdb(env = process.env) {
  const token = String(env["READ_TOKEN_MOVIE-DB"] ?? "").trim();
  if (token) return { tipo: "bearer", valor: token };
  const chave = String(env["API_KEY_MOVIE-DB"] ?? "").trim();
  if (chave) return { tipo: "key", valor: chave };
  return null;
}

function ordenarPorVoto(a, b) {
  const nota = Number(b?.vote_average) - Number(a?.vote_average);
  if (nota !== 0) return nota;
  return Number(b?.vote_count) - Number(a?.vote_count);
}

function empilhar(destino, vistos, lista, tipo, tamanho, titulo) {
  const ordenada = [...lista].sort(ordenarPorVoto);
  for (const item of ordenada) {
    if (destino.length >= TETO) break;
    const path = typeof item?.file_path === "string" ? item.file_path.trim() : "";
    if (!path || vistos.has(path)) continue;
    vistos.add(path);
    const rotulo =
      tipo === "poster"
        ? titulo
          ? `Pôster de ${titulo}`
          : "Pôster do filme"
        : titulo
          ? `Cena de ${titulo}`
          : "Imagem do filme";
    destino.push({
      src: urlDoPoster(path, tamanho),
      tipo,
      alt: rotulo,
      chave: path,
    });
  }
}

export function mapearImagensTmdb(payload, titulo = "") {
  const imagens = [];
  const vistos = new Set();
  const backdrops = Array.isArray(payload?.backdrops) ? payload.backdrops : [];
  const posters = Array.isArray(payload?.posters) ? payload.posters : [];
  empilhar(imagens, vistos, backdrops, "fundo", "w1280", titulo);
  empilhar(imagens, vistos, posters, "poster", "w780", titulo);
  return imagens;
}

export async function carregarImagensTmdb(
  filmeId,
  titulo = "",
  env = process.env,
  fetchFn = fetch,
) {
  if (!Number.isInteger(filmeId) || filmeId < 1) return [];
  const auth = autenticacaoTmdb(env);
  if (!auth) return [];

  const url = new URL(`https://api.themoviedb.org/3/movie/${filmeId}/images`);
  url.searchParams.set("include_image_language", "pt,null,en");

  const headers = { Accept: "application/json" };
  if (auth.tipo === "bearer") {
    headers.Authorization = `Bearer ${auth.valor}`;
  } else {
    url.searchParams.set("api_key", auth.valor);
  }

  try {
    const resposta = await fetchFn(url, {
      headers,
      next: { revalidate: 86400 },
    });
    if (!resposta.ok) return [];
    const payload = await resposta.json();
    return mapearImagensTmdb(payload, titulo);
  } catch {
    return [];
  }
}
