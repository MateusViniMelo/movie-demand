import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pagina = readFileSync(new URL("../app/genero/[id]/page.tsx", import.meta.url), "utf8");
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
  const lista = trecho(pagina, "resultado.filmes.map", 'aria-label="Páginas"');
  assert.match(lista, /<LinhaBusca key=\{filme\.id\} filme=\{filme\} faixa \/>/);
});

test("GEN-04 paginação e redirect usam pagina na URL do gênero", () => {
  assert.equal(pagina.includes("Página anterior"), true);
  assert.equal(pagina.includes("Próxima página"), true);
  assert.match(pagina, /numerosDePagina\(pagina, paginas\)/);
  assert.match(pagina, /aria-current="page"/);
  assert.match(pagina, /\/genero\/\$\{id\}/);
  assert.match(pagina, /pagina=\$\{pagina - 1\}/);
  assert.match(pagina, /pagina=\$\{pagina \+ 1\}/);
  assert.match(pagina, /pagina=\$\{numero\}/);
  assert.match(pagina, /String\(resultado\.pagina\) !== paginaBruta/);
  assert.match(
    pagina,
    /redirect\(`\/genero\/\$\{id\}\?pagina=\$\{resultado\.pagina\}`\)/,
  );
});

test("GEN-05 o título visível usa o nome do gênero", () => {
  assert.match(pagina, /resultado\.genero\.nome/);
  assert.match(pagina, /<h1/);
  assert.match(pagina, /id="conteudo"/);
});

test("GEN-06 metadados SEO usam o nome do gênero e noindex", () => {
  assert.match(seo, /export function metadadosDaGenero/);
  assert.match(pagina, /generateMetadata/);
  assert.match(pagina, /metadadosDaGenero/);
  assert.match(seo, /robots: \{ index: false, follow: false \}/);
});
