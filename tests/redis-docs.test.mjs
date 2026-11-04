import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const project = readFileSync(new URL("../.specs/project/PROJECT.md", import.meta.url), "utf8");
const state = readFileSync(new URL("../.specs/project/STATE.md", import.meta.url), "utf8");

test("RD-16 o README cita Redis 8 e REDIS_URL", () => {
  assert.match(readme, /Redis 8(?![\d.])/);
  assert.equal(readme.includes("REDIS_URL"), true);
});

test("RD-17 o PROJECT.md cita Redis 8", () => {
  assert.match(project, /Redis 8(?![\d.])/);
});

test("RD-18 o STATE.md registra AD-009", () => {
  const decisao = state.split("### AD-009")[1]?.split("### AD-010")[0] ?? "";
  assert.match(decisao, /nenhuma tela lê o Redis/);
});
