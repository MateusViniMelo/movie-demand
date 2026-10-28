import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const raiz = new URL("..", import.meta.url);
const page = readFileSync(new URL("app/page.tsx", raiz), "utf8");
const fileira = readFileSync(new URL("components/fileira.tsx", raiz), "utf8");
const poster = readFileSync(new URL("components/poster.tsx", raiz), "utf8");
const css = readFileSync(new URL("app/globals.css", raiz), "utf8");
const pkg = JSON.parse(readFileSync(new URL("package.json", raiz), "utf8"));

test("SWP-01 a home mostra as fileiras num Swiper", () => {
  assert.equal(typeof pkg.dependencies.swiper, "string");
  assert.match(page, /<Fileira/);
  assert.match(page, /titulo="Novidades"/);
  assert.match(page, /primeiroMaior/);
  const cartaz = readFileSync(new URL("lib/cartaz.mjs", raiz), "utf8");
  const populares = cartaz.indexOf("Filmes Populares");
  const novidades = cartaz.indexOf("Novidades");
  const avaliados = cartaz.indexOf("Filmes Bem avaliados");
  const cartazLista = cartaz.indexOf("Filmes em Cartaz");
  assert.equal(populares < novidades && novidades < avaliados && avaliados < cartazLista, true);
  assert.match(
    fileira,
    /import\s*\{[^}]*\bSwiper\b[^}]*\bSwiperSlide\b[^}]*\}\s*from\s*"swiper\/react"/,
  );
  assert.match(fileira, /import\s+"swiper\/css"/);
  assert.match(fileira, /slidesPerView="auto"/);
  assert.match(fileira, /slidesPerGroupAuto(?!=\{false\})/);
  assert.match(fileira, /wrapperTag="ul"/);
  assert.match(fileira, /tag="li"/);
  assert.equal(/<li[\s>]/.test(poster), false);
});

function trechoDoRotulo(rotulo) {
  const marca = "Rolar ${titulo} " + rotulo;
  const i = fileira.indexOf(marca);
  assert.notEqual(i, -1, marca);
  return fileira.slice(Math.max(0, i - 180), i);
}

test("SWP-02 as setas movem o grupo visível e a fileira para na ponta", () => {
  const esquerda = trechoDoRotulo("para a esquerda");
  const direita = trechoDoRotulo("para a direita");
  assert.match(esquerda, /slidePrev\(\)/);
  assert.equal(esquerda.includes("slideNext()"), false);
  assert.match(direita, /slideNext\(\)/);
  assert.equal(direita.includes("slidePrev()"), false);
  assert.match(fileira, /watchOverflow(?!=\{false\})/);
  assert.equal(/autoplay/i.test(fileira), false);
  assert.equal(/loop=\{true\}|loop:\s*true/.test(fileira), false);
});

test("SWP-03 movimento reduzido zera a velocidade", () => {
  assert.match(
    fileira,
    /swiper\.params\.speed\s*=\s*media\.matches\s*\?\s*0\s*:\s*VELOCIDADE/,
  );
});

test("SWP-04 fileira sem filmes não renderiza seção", () => {
  assert.match(fileira, /if\s*\(\s*filmes\.length\s*===\s*0\s*\)\s*return null;/);
});

test("SWP-05 a fileira mantém título e rótulos das setas", () => {
  assert.match(fileira, /id=\{rotulo\}/);
  assert.match(fileira, /aria-labelledby=\{rotulo\}/);
  assert.match(
    fileira,
    /primeiroMaior \? `fileira-\$\{titulo\}-destaque` : `fileira-\$\{titulo\}`/,
  );
  assert.match(fileira, /Rolar \$\{titulo\} para a esquerda/);
  assert.match(fileira, /Rolar \$\{titulo\} para a direita/);
});

test("a fileira guarda largura, espaço e recuo do pôster", () => {
  assert.match(fileira, /w-\[7\.75rem\]/);
  assert.match(fileira, /sm:w-\[11rem\]/);
  assert.match(fileira, /spaceBetween=\{8\}/);
  assert.match(fileira, /slidesOffsetBefore=\{16\}/);
  assert.match(fileira, /slidesOffsetAfter=\{16\}/);
  const largo = fileira.match(/640:\s*\{([^}]*)\}/);
  assert.ok(largo);
  assert.match(largo[1], /spaceBetween:\s*12/);
  assert.match(largo[1], /slidesOffsetBefore:\s*48/);
  assert.match(largo[1], /slidesOffsetAfter:\s*48/);
  assert.match(fileira, /lazyPreload=\{false\}/);
  assert.equal(css.includes("fileira-scroll"), false);
});
