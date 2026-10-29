import assert from "node:assert/strict";
import test from "node:test";
import {
  cabecalhoDaApi,
  descricaoDaBusca,
  descricaoDaHome,
  idiomaDoDocumento,
  jsonLdDoSite,
  metadadosDaBusca,
  metadadosDaHome,
  origemDoSite,
  regrasDeRobots,
  templateDeTitulo,
  tituloComTemplate,
  urlsDoSitemap,
} from "../lib/seo.mjs";

const origem = "https://cineverso.example";

test("SEO-01 a home publica título e descrição", () => {
  const home = metadadosDaHome(origem);
  assert.equal(home.title, "Cineverso");
  assert.equal(home.description, descricaoDaHome);
  assert.equal(
    home.description,
    "Catálogo de filmes sob demanda, com populares, novidades, bem avaliados e em cartaz.",
  );
});

test("SEO-02 a home publica canônica e Open Graph sem imagem", () => {
  const home = metadadosDaHome(origem);
  assert.equal(home.alternates.canonical, "https://cineverso.example/");
  assert.equal(home.openGraph.type, "website");
  assert.equal(home.openGraph.locale, "pt_BR");
  assert.equal(home.openGraph.siteName, "Cineverso");
  assert.equal(home.openGraph.title, "Cineverso");
  assert.equal(home.openGraph.description, descricaoDaHome);
  assert.equal(home.openGraph.url, "https://cineverso.example/");
  assert.equal("images" in home.openGraph, false);
  assert.equal(home.twitter.card, "summary");
  assert.equal(home.twitter.title, "Cineverso");
  assert.equal(home.twitter.description, descricaoDaHome);
  assert.equal("images" in home.twitter, false);
});

test("SEO-03 a home inclui JSON-LD WebSite", () => {
  const dados = jsonLdDoSite(origem);
  assert.equal(dados["@context"], "https://schema.org");
  assert.equal(dados["@type"], "WebSite");
  assert.equal(dados.name, "Cineverso");
  assert.equal(dados.inLanguage, "pt-BR");
  assert.equal(dados.url, "https://cineverso.example/");
  assert.equal(dados.description, descricaoDaHome);
  assert.equal("potentialAction" in dados, false);
});

test("SEO-04 o documento permanece em pt-BR", () => {
  assert.equal(idiomaDoDocumento, "pt-BR");
});

test("SEO-05 a busca fica noindex com título e descrição próprios", () => {
  const busca = metadadosDaBusca();
  assert.equal(busca.title, "Busca");
  assert.equal(templateDeTitulo, "%s — Cineverso");
  assert.equal(tituloComTemplate(busca.title), "Busca — Cineverso");
  assert.equal(busca.description, descricaoDaBusca);
  assert.equal(busca.description, "Resultados da busca no catálogo Cineverso.");
  assert.deepEqual(busca.robots, { index: false, follow: false });
  assert.equal(metadadosDaBusca.length, 0);
  assert.deepEqual(metadadosDaBusca(), busca);
});

test("SEO-06 a API pede noindex", () => {
  assert.deepEqual(cabecalhoDaApi(), { "X-Robots-Tag": "noindex" });
});

test("SEO-07 o sitemap não lista busca nem API", () => {
  const urls = urlsDoSitemap(origem).map((item) => item.url);
  assert.equal(urls.some((url) => url.includes("/busca")), false);
  assert.equal(urls.some((url) => url.includes("/api/busca")), false);
  assert.equal(urls.some((url) => url.includes("/api/")), false);
});

test("SEO-08 robots permite a home, bloqueia a API e aponta o sitemap", () => {
  const robots = regrasDeRobots(origem);
  assert.equal(robots.rules.userAgent, "*");
  assert.equal(robots.rules.allow, "/");
  assert.equal(robots.rules.disallow, "/api/");
  assert.equal(String(robots.rules.disallow).includes("/busca"), false);
  assert.equal(robots.sitemap, "https://cineverso.example/sitemap.xml");
});

test("SEO-09 o sitemap tem só a home absoluta", () => {
  const urls = urlsDoSitemap(origem);
  assert.equal(urls.length, 1);
  assert.equal(urls[0].url, "https://cineverso.example/");
});

test("SEO-10 origem inválida cai em localhost", () => {
  assert.equal(origemDoSite({}), "http://localhost:3000");
  assert.equal(origemDoSite({ NEXT_PUBLIC_SITE_URL: "" }), "http://localhost:3000");
  assert.equal(origemDoSite({ NEXT_PUBLIC_SITE_URL: "ftp://cineverso.example" }), "http://localhost:3000");
  assert.equal(origemDoSite({ NEXT_PUBLIC_SITE_URL: "cineverso.example" }), "http://localhost:3000");
  assert.equal(origemDoSite({ NEXT_PUBLIC_SITE_URL: "https://cineverso.example" }), "https://cineverso.example");
  assert.equal(origemDoSite({ NEXT_PUBLIC_SITE_URL: "https://cineverso.example/" }), "https://cineverso.example");
  assert.equal(
    origemDoSite({ NEXT_PUBLIC_SITE_URL: "https://cineverso.example/catalogo/" }),
    "https://cineverso.example/catalogo",
  );
});
