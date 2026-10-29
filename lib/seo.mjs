export const descricaoDaHome =
  "Catálogo de filmes sob demanda, com populares, novidades, bem avaliados e em cartaz.";

export const descricaoDaBusca = "Resultados da busca no catálogo Cineverso.";

export const templateDeTitulo = "%s — Cineverso";

export const idiomaDoDocumento = "pt-BR";

export function tituloComTemplate(segmento) {
  return templateDeTitulo.replace("%s", segmento);
}

export function origemDoSite(env = {}) {
  const bruto = env?.NEXT_PUBLIC_SITE_URL;
  if (typeof bruto !== "string" || bruto.trim() === "") return "http://localhost:3000";
  let url;
  try {
    url = new URL(bruto);
  } catch {
    return "http://localhost:3000";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return "http://localhost:3000";
  const caminho = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
  return `${url.origin}${caminho}`;
}

export function metadadosDaHome(origem) {
  const url = `${origem}/`;
  return {
    title: "Cineverso",
    description: descricaoDaHome,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: "Cineverso",
      title: "Cineverso",
      description: descricaoDaHome,
      url,
    },
    twitter: {
      card: "summary",
      title: "Cineverso",
      description: descricaoDaHome,
    },
  };
}

export function jsonLdDoSite(origem) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cineverso",
    url: `${origem}/`,
    inLanguage: idiomaDoDocumento,
    description: descricaoDaHome,
  };
}

export function metadadosDaBusca() {
  return {
    title: "Busca",
    description: descricaoDaBusca,
    robots: { index: false, follow: false },
  };
}

export function cabecalhoDaApi() {
  return { "X-Robots-Tag": "noindex" };
}

export function urlsDoSitemap(origem) {
  return [{ url: `${origem}/` }];
}

export function regrasDeRobots(origem) {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${origem}/sitemap.xml`,
  };
}
