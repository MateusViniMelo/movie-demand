export const FILEIRAS = [
  { titulo: "Filmes Populares", slug: "popular" },
  { titulo: "Novidades", slug: "upcoming" },
  { titulo: "Filmes Bem avaliados", slug: "top_rated" },
  { titulo: "Filmes em Cartaz", slug: "now_playing" },
];

export function urlDoPoster(posterPath, tamanho) {
  return `https://image.tmdb.org/t/p/${tamanho}${posterPath}`;
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
  return {
    destaque: upcoming.map((linha, index) => cartaz(linha, index === 0 ? "w780" : "w500")),
    fileiras: FILEIRAS.map(({ titulo, slug }) => ({
      titulo,
      filmes: (porSlug.get(slug) ?? []).map((linha) => cartaz(linha, "w500")),
    })),
  };
}
