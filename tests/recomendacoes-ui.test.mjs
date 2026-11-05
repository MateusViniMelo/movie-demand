import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { gravaEscolha } from "../lib/recomendacoes.mjs";

const poster = readFileSync(new URL("../components/poster.tsx", import.meta.url), "utf8");
const fileira = readFileSync(new URL("../components/fileira.tsx", import.meta.url), "utf8");
const hero = readFileSync(new URL("../components/hero.tsx", import.meta.url), "utf8");
const pagina = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const componente = readFileSync(new URL("../components/recomendacoes.tsx", import.meta.url), "utf8");

test("REC-04 só as três fileiras de baixo gravam o clique", () => {
  for (const titulo of ["Novidades", "Mais bem avaliados", "Filmes em Cartaz"]) {
    assert.equal(gravaEscolha(titulo), true, titulo);
  }
  assert.equal(gravaEscolha("Filmes Populares"), false);
  assert.equal(gravaEscolha("Recomendações"), false);
  assert.equal(hero.includes("registrarClique"), false);
  assert.equal(hero.includes("gravaEscolha"), false);
  assert.equal(hero.includes("cineverso.recomendacao"), false);
  assert.match(pagina, /gravaEscolha=\{gravaEscolha\(fileira\.titulo\)\}/);
  assert.equal(componente.includes("gravaEscolha"), false);
});

test("REC-06 enquanto a resposta não chega não há pôster", () => {
  const vazio = componente.indexOf("if (filmes.length === 0) return null");
  const lista = componente.indexOf("<Fileira");
  assert.ok(vazio >= 0 && lista > vazio);
  assert.match(componente, /useState<\{ id: number; titulo: string; src: string \}\[\]>\(\[\]\)/);
  const limpa = componente.indexOf("if (ativo) setFilmes([])");
  const pede = componente.indexOf("fetch(pedido)");
  assert.ok(limpa >= 0 && limpa < pede);
  assert.match(componente, /pedidoAtual === geracao/);
});

test("REC-09 Recomendações vem antes das fileiras de baixo", () => {
  const recomendacoes = pagina.indexOf("<Recomendacoes />");
  const fileiras = pagina.indexOf("fileiras.map");
  assert.ok(recomendacoes >= 0 && fileiras > recomendacoes);
  assert.match(componente, /titulo="Recomendações"/);
});

test("a página do filme pede recomendações desse filme", () => {
  const ficha = readFileSync(new URL("../app/filme/[id]/page.tsx", import.meta.url), "utf8");
  assert.match(ficha, /<Recomendacoes filmeId=\{filmeId\} \/>/);
  assert.match(componente, /origem \?\? lerArmazenamento\(localStorage\)/);
  assert.match(componente, /if \(origem === undefined\) window\.addEventListener\("storage", aoStorage\)/);
});

test("REC-10 o pôster de Recomendações abre o filme e não grava", () => {
  assert.match(poster, /href=\{caminhoDoFilme\(filme\.id\)\}/);
  assert.match(poster, /onClick=\{\(\) => aoEscolher\?\.\(filme\.id\)\}/);
  assert.match(
    fileira,
    /aoEscolher=\{gravaEscolha \? \(id\) => registrarClique\(localStorage, id\) : undefined\}/,
  );
  const fileiraDaHome = componente.slice(componente.indexOf("return <Fileira"));
  assert.equal(fileiraDaHome.includes("gravaEscolha"), false);
  assert.match(fileiraDaHome, /titulo="Recomendações"/);
});
