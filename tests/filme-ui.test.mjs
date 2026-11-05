import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fichaDaBusca } from "../lib/busca.mjs";
import { montarVitrine } from "../lib/cartaz.mjs";
import { caminhoDoFilme } from "../lib/filme.mjs";

const pagina = readFileSync(new URL("../app/filme/[id]/page.tsx", import.meta.url), "utf8");
const seo = readFileSync(new URL("../lib/seo.mjs", import.meta.url), "utf8");
const poster = readFileSync(new URL("../components/poster.tsx", import.meta.url), "utf8");
const hero = readFileSync(new URL("../components/hero.tsx", import.meta.url), "utf8");
const busca = readFileSync(new URL("../components/busca.tsx", import.meta.url), "utf8");
const paginaBusca = readFileSync(new URL("../app/busca/page.tsx", import.meta.url), "utf8");

function trecho(fonte, inicio, fim) {
  const de = fonte.indexOf(inicio);
  const ate = fonte.indexOf(fim, de + inicio.length);
  assert.ok(de >= 0 && ate > de, inicio);
  return fonte.slice(de, ate);
}

test("PAG-01 o pôster da fileira abre /filme/{id}", () => {
  assert.match(poster, /href=\{caminhoDoFilme\(filme\.id\)\}/);
  assert.match(poster, /alt=\{filme\.titulo\}/);
  const vitrine = montarVitrine([
    { slug: "upcoming", posicao: 2, id: 155, titulo: "Batman", posterPath: "/a.jpg" },
    { slug: "popular", posicao: 9, id: 969681, titulo: "Aranha", posterPath: "/b.jpg" },
  ]);
  const cartazes = [
    ...vitrine.destaque,
    ...vitrine.fileiras.flatMap((fileira) => fileira.filmes),
  ];
  assert.deepEqual(
    cartazes.map((filme) => filme.id),
    [155, 969681, 155],
  );
  for (const filme of cartazes) {
    assert.equal(caminhoDoFilme(filme.id), `/filme/${filme.id}`);
  }
});

test("PAG-02 o título do slide atual do hero abre /filme/{id}", () => {
  const titulo = trecho(hero, "<h1", "</h1>");
  assert.match(titulo, /href=\{caminhoDoFilme\(filme\.id\)\}/);
  assert.match(titulo, /\{filme\.titulo\}/);
  const vitrine = montarVitrine([
    {
      slug: "popular",
      posicao: 4,
      id: 1368337,
      titulo: "A Odisseia",
      posterPath: "/p.jpg",
      backdropPath: "/b.jpg",
      sinopse: "",
      duracaoMin: 0,
      generos: ["Aventura"],
    },
  ]);
  assert.equal(vitrine.hero[0].id, 1368337);
  assert.equal(caminhoDoFilme(vitrine.hero[0].id), "/filme/1368337");
});

test("PAG-03 a linha da busca no painel e em /busca abre /filme/{id}", () => {
  const linha = trecho(busca, "export function LinhaBusca", "export function Busca");
  assert.match(linha, /href=\{caminhoDoFilme\(filme\.id\)\}/);
  assert.match(linha, /\{filme\.titulo\}/);
  assert.match(trecho(busca, "vigente.filmes.map", 'vigente?.estado === "nenhum"'), /<LinhaBusca/);
  assert.match(trecho(paginaBusca, "resultado.filmes.map", 'aria-label="Páginas"'), /<LinhaBusca/);
  const ficha = fichaDaBusca({
    id: 969681,
    titulo: "Homem-Aranha: Um Novo Dia",
    genero: "Aventura",
    duracao_min: 143,
    backdrop_path: "/fundo.jpg",
  });
  assert.equal(ficha.id, 969681);
  assert.equal(caminhoDoFilme(ficha.id), "/filme/969681");
});

test("PAG-13 os controles do hero continuam botões", () => {
  const botoes = [...hero.matchAll(/<button[\s\S]*?<\/button>/g)].map((achado) => achado[0]);
  for (const rotulo of ["Filme anterior", "Próximo filme", "Pausar a troca automática"]) {
    const botao = botoes.find((item) => item.includes(rotulo));
    assert.ok(botao, rotulo);
    assert.equal(botao.includes("caminhoDoFilme"), false, rotulo);
    assert.equal(botao.includes("<Link"), false, rotulo);
  }
});

test("PAG-07 a página não mostra sinopse, gênero, duração, elenco, nota, trailer nem player", () => {
  for (const palavra of [
    "sinopse",
    "genero",
    "gênero",
    "duracao",
    "duração",
    "elenco",
    "nota",
    "trailer",
    "player",
  ]) {
    assert.equal(pagina.toLowerCase().includes(palavra), false, palavra);
  }
  assert.match(pagina, /<h1[\s\S]*\{ficha\.titulo\}[\s\S]*<\/h1>/);
  assert.match(pagina, /ficha\.fundo \? \(/);
  assert.match(pagina, /min-h-\[78vh\]/);
  assert.match(pagina, /bg-gradient-to-r from-black\/85 via-black\/45 to-transparent/);
  assert.match(pagina, /bg-gradient-to-t from-stage to-transparent/);
  assert.match(pagina, /font-display text-5xl leading-\[0\.95\]/);
  assert.match(pagina, /<Image src=\{ficha\.fundo\} alt="" fill/);
  assert.equal(pagina.includes(".replace("), false);
});

test("PAG-09 filme ausente ou id inválido responde não encontrado", () => {
  assert.equal((pagina.match(/if \(filmeId === null\) notFound\(\)/g) ?? []).length, 2);
  assert.equal((pagina.match(/if \(!linha\) notFound\(\)/g) ?? []).length, 2);
});

test("PAG-10 o segmento do título é o título do filme", () => {
  assert.match(pagina, /return \{ title: ficha\.titulo \}/);
  assert.equal(seo.includes('export const templateDeTitulo = "%s — Cineverso"'), true);
});

test("PAG-11 a página tem o topo e o voltar sobre o still", () => {
  assert.match(pagina, /<Topo \/>/);
  assert.match(pagina, /<Voltar tom="still" \/>/);
  const fallback = trecho(pagina, "fallback={", "</Suspense>");
  assert.equal(fallback.includes("<Voltar />"), true);
});

test("PAG-12 enquanto carrega a página mostra Carregando o filme…", () => {
  const fallback = trecho(pagina, "fallback={", "</Suspense>");
  assert.equal(fallback.includes("Carregando o filme…"), true);
});
