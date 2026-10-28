import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const busca = readFileSync(new URL("../components/busca.tsx", import.meta.url), "utf8");
const topo = readFileSync(new URL("../components/topo.tsx", import.meta.url), "utf8");
const rota = readFileSync(new URL("../app/api/busca/route.ts", import.meta.url), "utf8");
const pagina = readFileSync(new URL("../app/busca/page.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

function trecho(fonte, inicio, fim) {
  const de = fonte.indexOf(inicio);
  const ate = fonte.indexOf(fim, de);
  assert.ok(de >= 0 && ate > de);
  return fonte.slice(de, ate);
}

test("BUS-01 digitar no topo pede cinco fichas com banner, título, gênero e duração", () => {
  assert.match(topo, /<Busca modo=\{modo\} textoInicial=\{textoInicial\} \/>/);
  assert.match(topo, /modo = "painel"/);
  assert.match(busca, /\/api\/busca/);
  assert.match(busca, /tamanho: "5"/);
  assert.match(busca, /setTimeout\(\(\) => \{[\s\S]*?\}, ESPERA\)/);
  assert.match(busca, /const ESPERA = 200/);
  assert.match(busca, /filme\.banner/);
  assert.match(busca, /filme\.titulo/);
  assert.match(busca, /filme\.genero/);
  assert.match(busca, /filme\.duracao/);
  assert.match(busca, /<button\s+type="submit"[\s\S]*?>\s*Busca completa\s*<\/button>/);
  assert.match(busca, /\.slice\(0, 5\)/);
});

test("BUS-02 campo vazio ou só com espaços fecha o painel", () => {
  assert.match(busca, /if \(!texto\.trim\(\)\) return/);
  assert.match(
    busca,
    /painelAberto = modo === "painel" && texto\.trim\(\)\.length > 0 && vigente !== null/,
  );
});

test("BUS-03 nenhum filme mostra o texto combinado", () => {
  assert.equal(busca.includes("Nenhum filme para esta busca."), true);
  assert.equal(pagina.includes("Nenhum filme para esta busca."), true);
});

test("BUS-04 falha do banco mostra o texto e a rota responde 500", () => {
  assert.equal(busca.includes("A busca falhou."), true);
  assert.equal(pagina.includes("A busca falhou."), true);
  assert.match(rota, /status: 500/);
  assert.match(rota, /estado: "erro"/);
  assert.equal(rota.includes("ts_rank"), false);
  assert.equal(rota.includes("tempo"), false);
});

test("BUS-05 Enter e Busca completa abrem a página no mesmo texto", () => {
  assert.equal(busca.includes("Busca completa"), true);
  assert.match(busca, /action="\/busca"/);
  assert.match(busca, /method="get"/);
  assert.match(busca, /name="q"/);
  assert.match(busca, /name="pagina" value="1"/);
  assert.match(busca, /type="search"/);
  assert.match(busca, /aria-label="Busca completa"/);
  assert.match(busca, /href=\{texto\.trim\(\) \? destino : "\/busca"\}/);
  assert.match(busca, /<Search/);
  assert.match(topo, /sm:max-w-sm sm:justify-self-end/);
  assert.match(busca, /if \(!texto\.trim\(\)\) event\.preventDefault\(\)/);
  assert.match(busca, /\/busca\?q=\$\{encodeURIComponent\(texto\.trim\(\)\)\}&pagina=1/);
});

test("BUS-06 as linhas do resultado não têm href de ficha", () => {
  const linha = trecho(busca, "export function LinhaBusca", "export function Busca");
  assert.match(linha, /<article/);
  assert.equal(linha.includes("href"), false);
  assert.equal(/<a[\s>/]/.test(linha), false);
  assert.equal(linha.includes("<Link"), false);
  const lista = trecho(busca, "vigente.filmes.map", "vigente?.estado === \"nenhum\"");
  assert.match(lista, /<LinhaBusca/);
  assert.equal(lista.includes("href"), false);
  const listaPagina = trecho(pagina, "resultado.filmes.map", "aria-label=\"Páginas\"");
  assert.match(listaPagina, /<LinhaBusca/);
  assert.equal(listaPagina.includes("href"), false);
});

test("BUS-18 a tela não mostra ts_rank nem o tempo da consulta", () => {
  for (const fonte of [busca, pagina, rota, topo]) {
    assert.equal(fonte.includes("ts_rank"), false);
    assert.equal(fonte.includes("tempo"), false);
    assert.equal(fonte.includes("nota"), false);
  }
});

test("BUS-07 a página lista até 10 filmes na coluna central", () => {
  assert.match(pagina, /mx-auto w-full max-w-6xl/);
  assert.match(pagina, /tamanho: 10/);
  assert.match(pagina, /<LinhaBusca key=\{filme\.id\} filme=\{filme\} faixa \/>/);
});

test("BUS-08 Página anterior e Próxima página mudam pagina", () => {
  assert.equal(pagina.includes("Página anterior"), true);
  assert.equal(pagina.includes("Próxima página"), true);
  assert.match(pagina, /pagina=\$\{pagina - 1\}/);
  assert.match(pagina, /pagina=\$\{pagina \+ 1\}/);
  assert.match(pagina, /numerosDePagina\(pagina, paginas\)/);
  assert.match(pagina, /aria-current="page"/);
  assert.match(pagina, /pagina=\$\{numero\}/);
  assert.match(busca, /if \(consulta === qAtual\) return/);
});

test("BUS-09 a página redireciona quando a pagina pedida não é o corte", () => {
  assert.match(
    pagina,
    /resultado\.estado !== "vazio" && String\(resultado\.pagina\) !== paginaBruta/,
  );
  assert.match(pagina, /redirect\(`\/busca\?q=\$\{encodeURIComponent\(q\)\}&pagina=\$\{resultado\.pagina\}`\)/);
});

test("BUS-10 sem q a página pede um filme e não lista ficha", () => {
  assert.equal(pagina.includes("Digite um filme para buscar."), true);
  assert.match(pagina, /resultado\.estado === "vazio"/);
  const vazio = trecho(pagina, 'resultado.estado === "vazio"', 'resultado.estado === "nenhum"');
  assert.equal(vazio.includes("LinhaBusca"), false);
  assert.equal(vazio.includes("filmes.map"), false);
});

test("BUS-11 a home não lê a query e o topo não usa useSearchParams", () => {
  assert.equal(home.includes("searchParams"), false);
  assert.equal(home.includes("useSearchParams"), false);
  assert.equal(topo.includes("useSearchParams"), false);
  assert.equal(busca.includes("useSearchParams"), false);
  assert.match(pagina, /<Suspense/);
  const suspenso = pagina.slice(pagina.indexOf("<Suspense"));
  assert.match(suspenso, /<Resultado searchParams=\{props\.searchParams\} \/>/);
  assert.match(pagina, /const params = await searchParams/);
});

test("BUS-22 a rota entrega q, pagina e tamanho para a mesma busca", () => {
  assert.match(rota, /url\.searchParams\.get\("q"\)/);
  assert.match(rota, /url\.searchParams\.get\("pagina"\)/);
  assert.match(rota, /url\.searchParams\.get\("tamanho"\)/);
  assert.match(rota, /buscarFilmes\(\{ texto: q, pagina, tamanho \}\)/);
});
