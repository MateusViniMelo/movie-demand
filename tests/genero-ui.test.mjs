import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pagina = readFileSync(new URL("../app/genero/page.tsx", import.meta.url), "utf8");
const redireciona = readFileSync(new URL("../app/genero/[id]/page.tsx", import.meta.url), "utf8");
const topo = readFileSync(new URL("../components/topo.tsx", import.meta.url), "utf8");
const seletor = readFileSync(new URL("../components/seletor-generos.tsx", import.meta.url), "utf8");
const paginas = readFileSync(new URL("../components/paginas.tsx", import.meta.url), "utf8");
const seo = readFileSync(new URL("../lib/seo.mjs", import.meta.url), "utf8");

function trecho(fonte, inicio, fim) {
  const de = fonte.indexOf(inicio);
  const ate = fonte.indexOf(fim, de);
  assert.ok(de >= 0 && ate > de);
  return fonte.slice(de, ate);
}

test("GEN-01 a página usa Topo com busca textual, Voltar e buscarFilmesPorGenero", () => {
  assert.match(pagina, /<Topo/);
  assert.equal(pagina.includes("comBusca={false}"), false);
  assert.match(pagina, /<Voltar/);
  assert.match(pagina, /buscarFilmesPorGenero/);
  assert.match(pagina, /tamanho: 10/);
  assert.match(pagina, /<Suspense/);
  assert.match(pagina, /mx-auto w-full max-w-6xl/);
  assert.match(pagina, /generoIds/);
});

test("GEN-02 gênero ausente, nenhum filme e falha têm mensagens distintas", () => {
  assert.equal(pagina.includes("Gênero não encontrado."), true);
  assert.equal(pagina.includes("Nenhum filme para este gênero."), true);
  assert.equal(pagina.includes("A busca por gênero falhou."), true);
  assert.match(pagina, /resultado\.estado === "ausente"/);
  assert.match(pagina, /resultado\.estado === "nenhum"/);
  assert.match(pagina, /catch/);
});

test("GEN-03 cada linha abre a ficha e a lista usa LinhaBusca", () => {
  const lista = trecho(pagina, "resultado.filmes.map", "<Paginas");
  assert.match(lista, /<LinhaBusca key=\{filme\.id\} filme=\{filme\} faixa \/>/);
});

test("GEN-04 paginação e redirect usam g e pagina na URL", () => {
  assert.equal(paginas.includes("Página anterior"), true);
  assert.equal(paginas.includes("Próxima página"), true);
  assert.match(paginas, /numerosDePagina\(pagina, paginas\)/);
  assert.match(pagina, /from "@\/components\/paginas"/);
  assert.match(pagina, /caminhoDaBuscaPorGenero/);
  assert.match(pagina, /String\(resultado\.pagina\) !== paginaBruta/);
  assert.match(pagina, /redirect\(caminhoDaBuscaPorGenero/);
});

test("GEN-05 o título visível usa os nomes dos gêneros", () => {
  assert.match(pagina, /tituloDosGeneros/);
  assert.match(pagina, /<h1/);
  assert.match(pagina, /id="conteudo"/);
});

test("GEN-06 metadados SEO usam o nome do gênero e noindex", () => {
  assert.match(seo, /export function metadadosDoGenero/);
  assert.match(pagina, /generateMetadata/);
  assert.match(pagina, /metadadosDoGenero/);
  assert.match(pagina, /tamanho: 1/);
  assert.match(seo, /robots: \{ index: false, follow: false \}/);
});

test("GEN-07 /genero/[id] redireciona para a query g", () => {
  assert.match(redireciona, /redirect\(caminhoDaBuscaPorGenero/);
  assert.match(redireciona, /idsDeGenero/);
});

test("GEN-08 o topo tem select múltiplo de gêneros", () => {
  assert.match(topo, /SeletorGeneros/);
  assert.match(seletor, /aria-multiselectable="true"/);
  assert.match(seletor, /type="checkbox"/);
  assert.match(seletor, /Ver filmes/);
  assert.match(seletor, /caminhoDaBuscaPorGenero/);
  assert.match(seletor, /\/api\/generos/);
});
