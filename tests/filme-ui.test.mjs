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
const carrossel = readFileSync(
  new URL("../components/carrossel-imagens.tsx", import.meta.url),
  "utf8",
);
const carrosselElenco = readFileSync(
  new URL("../components/carrossel-elenco.tsx", import.meta.url),
  "utf8",
);

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

test("PAG-07 a página mostra meta, sinopse, trailer, imagens e elenco", () => {
  assert.match(pagina, /<h1[\s\S]*\{ficha\.titulo\}[\s\S]*<\/h1>/);
  assert.match(pagina, /ficha\.meta \?[\s\S]*\{ficha\.meta\}/);
  assert.match(pagina, /ficha\.sinopse/);
  const meta = pagina.indexOf("ficha.meta");
  const sinopse = pagina.indexOf("ficha.sinopse");
  assert.ok(meta >= 0 && sinopse > meta, "sinopse sob a meta");
  assert.match(pagina, /ficha\.fundo \? \(/);
  assert.match(pagina, /min-h-\[78vh\]/);
  assert.match(pagina, /bg-gradient-to-r from-black\/85 via-black\/45 to-transparent/);
  assert.match(pagina, /bg-gradient-to-t from-stage to-transparent/);
  assert.match(pagina, /font-display text-5xl leading-\[0\.95\]/);
  assert.match(pagina, /<Image src=\{ficha\.fundo\} alt="" fill/);
  assert.equal(pagina.includes(".replace("), false);

  const faixa = trecho(pagina, 'className="faixa-ficha', "</>");
  assert.match(faixa, /ficha\.trailerEmbed/);
  assert.match(faixa, /id="trailer"/);
  assert.match(faixa, /<h2[\s\S]*Trailer[\s\S]*<\/h2>/);
  assert.match(faixa, /<iframe[\s\S]*src=\{ficha\.trailerEmbed\}/);
  assert.match(faixa, /title=\{`Trailer de \$\{ficha\.titulo\}`\}/);
  assert.match(faixa, /loading="lazy"/);
  assert.match(faixa, /allowFullScreen/);
  assert.equal(faixa.toLowerCase().includes("autoplay"), false);
  assert.match(faixa, /href=\{ficha\.trailerUrl\}/);
  assert.match(faixa, /rel="noopener noreferrer"/);
  assert.match(pagina, /carregarImagensTmdb/);
  assert.match(pagina, /imagensTmdb\.length > 0 \? imagensTmdb : ficha\.imagens/);
  assert.match(faixa, /imagens\.length/);
  assert.match(faixa, /id="imagens"/);
  assert.match(faixa, /<h2[\s\S]*Imagens[\s\S]*<\/h2>/);
  assert.match(faixa, /<CarrosselImagens imagens=\{imagens\}/);
  assert.match(faixa, /ficha\.elenco\.length/);
  assert.match(faixa, /<h2[\s\S]*Elenco[\s\S]*<\/h2>/);
  assert.match(faixa, /<CarrosselElenco pessoas=\{ficha\.elenco\}/);
  assert.match(faixa, /<Recomendacoes/);
  assert.ok(faixa.indexOf("Trailer") < faixa.indexOf("Imagens"), "trailer acima das imagens");
  assert.ok(faixa.indexOf("Imagens") < faixa.indexOf("Elenco"), "imagens acima do elenco");
  assert.ok(faixa.indexOf("Elenco") < faixa.indexOf("<Recomendacoes"), "elenco acima das recomendações");
  const still = trecho(pagina, 'aria-labelledby="conteudo"', 'className="faixa-ficha');
  assert.equal(still.toLowerCase().includes("elenco"), false);
  assert.equal(still.toLowerCase().includes("iframe"), false);
  assert.match(still, /href="#trailer"/);
  assert.match(still, /Ver trailer/);
});

test("PAG-22 o carrossel de imagens usa Swiper sem autoplay e com setas", () => {
  assert.match(carrossel, /from "swiper\/react"/);
  assert.match(carrossel, /aria-roledescription="carrossel"/);
  assert.match(carrossel, /aria-label="Imagens do filme"/);
  assert.match(carrossel, /Imagem anterior/);
  assert.match(carrossel, /Próxima imagem/);
  assert.match(carrossel, /prefers-reduced-motion/);
  assert.equal(carrossel.toLowerCase().includes("autoplay"), false);
  assert.match(carrossel, /<Image[\s\S]*alt=\{imagem\.alt\}/);
  assert.match(carrossel, /aspect-video/);
  assert.match(carrossel, /aspect-\[2\/3\]/);
});

test("PAG-23 o carrossel do elenco mostra foto, nome embaixo e setas sem autoplay", () => {
  assert.match(carrosselElenco, /from "swiper\/react"/);
  assert.match(carrosselElenco, /aria-roledescription="carrossel"/);
  assert.match(carrosselElenco, /aria-label="Elenco"/);
  assert.match(carrosselElenco, /Pessoa anterior do elenco/);
  assert.match(carrosselElenco, /Próxima pessoa do elenco/);
  assert.match(carrosselElenco, /prefers-reduced-motion/);
  assert.equal(carrosselElenco.toLowerCase().includes("autoplay"), false);
  assert.match(carrosselElenco, /pessoa\.foto/);
  assert.match(carrosselElenco, /<figcaption/);
  assert.match(carrosselElenco, /\{pessoa\.nome\}/);
  assert.match(carrosselElenco, /pessoa\.personagem/);
  assert.match(carrosselElenco, /aspect-\[2\/3\]/);
  assert.match(carrosselElenco, /key=\{pessoa\.pessoaId\}/);
});

test("PAG-17 sinopse longa tem expandir/recolher acessível na ficha e no hero", () => {
  const sinopse = readFileSync(
    new URL("../components/sinopse-expansivel.tsx", import.meta.url),
    "utf8",
  );
  assert.match(pagina, /SinopseExpansivel/);
  assert.match(hero, /SinopseExpansivel/);
  assert.match(sinopse, /aria-expanded=\{/);
  assert.match(sinopse, /line-clamp-3/);
  assert.match(sinopse, /Mostrar sinopse completa/);
  assert.match(sinopse, /Recolher sinopse/);
  assert.match(sinopse, /focus-visible:outline/);
  assert.match(sinopse, /flex flex-col items-start/);
  assert.equal(sinopse.includes("self-start"), false);
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
