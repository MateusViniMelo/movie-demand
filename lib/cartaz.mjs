export const FILEIRAS = [
  { titulo: "Filmes Populares", slug: "popular" },
  { titulo: "Novidades", slug: "upcoming" },
  { titulo: "Mais bem avaliados", slug: "top_rated" },
  { titulo: "Filmes em Cartaz", slug: "now_playing" },
];

export function urlDoPoster(posterPath, tamanho) {
  return `https://image.tmdb.org/t/p/${tamanho}${posterPath}`;
}

export function formatarDuracao(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return new Intl.DurationFormat("pt-BR", { style: "short" }).format({
    hours: horas,
    minutes: resto,
  });
}

function fichaDoHero(linha) {
  const generos = Array.isArray(linha.generos) ? linha.generos.filter(Boolean) : [];
  const partes = [];
  if (Number.isFinite(linha.duracaoMin) && linha.duracaoMin > 0) {
    partes.push(formatarDuracao(linha.duracaoMin));
  }
  partes.push(...generos.slice(1));

  return {
    id: linha.id,
    titulo: linha.titulo,
    poster: urlDoPoster(linha.posterPath, "w500"),
    backdrop: linha.backdropPath ? urlDoPoster(linha.backdropPath, "w1280") : null,
    sinopse: typeof linha.sinopse === "string" ? linha.sinopse : "",
    genero: generos[0] ?? "Filmes Populares",
    meta: partes.join(" · "),
  };
}

export function montarVitrine(linhas) {
  const porSlug = new Map();
  for (const linha of linhas) {
    if (!linha.posterPath) continue;
    const lista = porSlug.get(linha.slug) ?? [];
    lista.push(linha);
    porSlug.set(linha.slug, lista);
  }
  for (const lista of porSlug.values()) {
    lista.sort((a, b) => a.posicao - b.posicao);
  }

  const cartaz = (linha, tamanho) => ({
    id: linha.id,
    titulo: linha.titulo,
    src: urlDoPoster(linha.posterPath, tamanho),
  });

  const upcoming = porSlug.get("upcoming") ?? [];
  const popular = porSlug.get("popular") ?? [];
  return {
    destaque: upcoming.map((linha, index) => cartaz(linha, index === 0 ? "w780" : "w500")),
    hero: popular.map((linha) => fichaDoHero(linha)),
    fileiras: FILEIRAS.map(({ titulo, slug }) => ({
      titulo,
      filmes: (porSlug.get(slug) ?? []).map((linha) => cartaz(linha, "w500")),
    })),
  };
}
