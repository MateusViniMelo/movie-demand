import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const poster = readFileSync(new URL("../components/poster.tsx", import.meta.url), "utf8");
const fileira = readFileSync(new URL("../components/fileira.tsx", import.meta.url), "utf8");
const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
const vitrine = readFileSync(new URL("../lib/vitrine.ts", import.meta.url), "utf8");

test("VIT-06 a home mostra o destaque e as quatro fileiras", () => {
  assert.match(page, /titulo="Novidades"/);
  assert.match(page, /primeiroMaior/);
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
  assert.equal(page.includes("Hero"), false);
});

test("VIT-09 a home mostra o texto de carregamento", () => {
  assert.equal(page.includes("Carregando o catálogo."), true);
  assert.match(page, /<Suspense/);
});

test("VIT-10 o catálogo vazio mostra a frase existente", () => {
  assert.equal(page.includes("Nenhuma ficha neste catálogo."), true);
  assert.match(page, /destaque\.length === 0 && fileiras\.every/);
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
