import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const project = readFileSync(new URL("../.specs/project/PROJECT.md", import.meta.url), "utf8");
const state = readFileSync(new URL("../.specs/project/STATE.md", import.meta.url), "utf8");

test("DB-23 o README cita db:up e prisma migrate dev", () => {
  assert.equal(readme.includes("npm run db:up"), true);
  assert.equal(readme.includes("npx prisma migrate dev"), true);
});

test("CAT-37 o README cita db:seed e data/tmdb", () => {
  assert.equal(readme.includes("npm run db:seed"), true);
  assert.equal(readme.includes("data/tmdb"), true);
});

test("CAT-38 o STATE.md registra AD-006", () => {
  const decisao = state.split("### AD-006")[1]?.split("### AD-007")[0] ?? "";
  assert.match(decisao, /Substituir as colunas do experimento/);
  assert.match(decisao, /lib\/filmes\.ts/);
});

test("VIT-13 o README aponta a home para as listas", () => {
  assert.equal(readme.includes("Filmes Populares"), true);
  assert.equal(readme.includes("A home continua lendo"), false);
});

test("VIT-14 o STATE.md registra AD-007", () => {
  const decisao = state.split("### AD-007")[1] ?? "";
  assert.match(decisao, /home lê as listas do PostgreSQL/);
});

test("DB-24 o PROJECT.md cita PostgreSQL 17 e Prisma 7", () => {
  assert.equal(project.includes("PostgreSQL 17"), true);
  assert.equal(project.includes("Prisma 7"), true);
});

test("DB-25 o STATE.md registra Prisma na consulta e pg como driver", () => {
  assert.match(state, /A consulta da aplicação passa pelo Prisma/);
  assert.match(state, /O pacote `pg` fica só como driver/);
});
