import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const poster = readFileSync(new URL("../components/poster.tsx", import.meta.url), "utf8");
const fileira = readFileSync(new URL("../components/fileira.tsx", import.meta.url), "utf8");
const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
const vitrine = readFileSync(new URL("../lib/vitrine.ts", import.meta.url), "utf8");

test("VIT-06 a home mostra as fileiras sem repetir Novidades", () => {
  assert.equal(page.includes('titulo="Novidades"'), false);
  assert.equal(page.includes("primeiroMaior"), false);
  assert.match(page, /fileiras\.map/);
  assert.match(page, /<Fileira/);
  assert.equal(page.includes("Drama"), false);
  assert.equal(page.includes("Ficção"), false);
  assert.equal(page.includes("Animação"), false);
});

test("VIT-07 o primeiro slide do destaque é maior", () => {
  assert.match(
    fileira,
    /primeiroMaior && index === 0\s*\?\s*"w-\[14rem\]! sm:w-\[22rem\]!"\s*:\s*"w-\[7\.75rem\]! sm:w-\[11rem\]!"/,
  );
});

test("VIT-08 o pôster é só a imagem com alt do título", () => {
  assert.match(poster, /filme:\s*\{\s*titulo:\s*string;\s*src:\s*string\s*\}/);
  assert.match(poster, /alt=\{filme\.titulo\}/);
  const jsx = poster.slice(poster.indexOf("return"));
  assert.deepEqual(
    [...jsx.matchAll(/<([A-Za-z]+)/g)].map((tag) => tag[1]),
    ["figure", "div", "Image"],
  );
  assert.match(page, /<Hero filmes=\{hero\}/);
});

test("o hero troca o cartaz sozinho e pelas setas", () => {
  const hero = readFileSync(new URL("../components/hero.tsx", import.meta.url), "utf8");
  assert.match(page, /fileira\.titulo === "Filmes Populares" \? null/);
  assert.equal(hero.includes('role="radiogroup"'), false);
  assert.equal(hero.includes('role="radio"'), false);
  assert.match(hero, /Filme anterior/);
  assert.match(hero, /Próximo filme/);
  assert.match(hero, /Pausar a troca automática/);
  assert.match(hero, /setInterval/);
  assert.match(hero, /prefers-reduced-motion: reduce/);
  assert.match(hero, /ArrowRight/);
  assert.match(hero, /ArrowLeft/);
  assert.match(hero, /preload=\{true\}/);
  assert.match(hero, /min-h-\[78vh\]/);
  assert.match(hero, /bg-gradient-to-r from-black\/85 via-black\/45 to-transparent/);
  assert.match(hero, /bg-gradient-to-t from-stage to-transparent/);
  assert.match(hero, /text-5xl leading-\[0\.95\].*sm:text-7xl/);
  assert.match(hero, /-mt-10/);
});

test("VIT-09 a home mostra o texto de carregamento", () => {
  assert.equal(page.includes("Carregando o catálogo…"), true);
  assert.match(page, /<Suspense/);
});

test("VIT-10 o catálogo vazio mostra a frase existente", () => {
  assert.equal(page.includes("Nenhuma ficha neste catálogo."), true);
  assert.match(
    page,
    /destaque\.length === 0 && fileiras\.every\(\(fileira\) => fileira\.filmes\.length === 0\)/,
  );
});

test("VIT-11 o Next libera as imagens do TMDB", () => {
  assert.match(config, /hostname:\s*"image\.tmdb\.org"/);
  assert.match(config, /pathname:\s*"\/t\/p\/\*\*"/);
  assert.match(config, /protocol:\s*"https"/);
});

test("VIT-12 a home consulta o Prisma e não lê lib/filmes", () => {
  assert.match(page, /carregarVitrine/);
  assert.match(vitrine, /from "@\/lib\/prisma"/);
  assert.equal(page.includes("@/lib/filmes"), false);
  assert.equal(page.includes("generated/prisma"), false);
});
