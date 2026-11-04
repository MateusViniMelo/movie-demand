import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const source = readFileSync(new URL("../lib/redis.ts", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

function arquivos(dir) {
  const saida = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) saida.push(...arquivos(caminho));
    else if (/\.(tsx?|jsx?|mjs)$/.test(nome)) saida.push(caminho);
  }
  return saida;
}

test("RD-10 exporta um único redis com createClient e REDIS_URL", () => {
  const exports = [...source.matchAll(/export const (\w+)/g)].map((match) => match[1]);
  assert.deepEqual(exports, ["redis"]);
  assert.match(source, /export const redis = globalForRedis\.redis \?\? criarCliente\(\);/);
  assert.match(
    source,
    /function criarCliente\(\) \{\n  return createClient\(\{ url: process\.env\.REDIS_URL \}\);\n\}/,
  );
});

test("RD-11 guarda o cliente em globalThis fora de production", () => {
  assert.match(source, /globalThis/);
  assert.match(
    source,
    /if \(process\.env\.NODE_ENV !== "production"\) \{\n  globalForRedis\.redis = redis;\n\}/,
  );
});

test("RD-12 omite a chamada connect(", () => {
  assert.equal(source.includes("connect("), false);
});

test("RD-13 dependencies inclui o pacote redis", () => {
  assert.equal(typeof pkg.dependencies.redis, "string");
  assert.notEqual(pkg.dependencies.redis, "");
});

test("RD-14 db:up continua docker compose up -d", () => {
  assert.equal(pkg.scripts["db:up"], "docker compose up -d");
});

test("RD-15 app e components não importam o redis", () => {
  const ofensores = [];
  for (const caminho of ["app", "components"].flatMap((dir) => arquivos(dir))) {
    const texto = readFileSync(caminho, "utf8");
    if (
      texto.includes("@/lib/redis") ||
      /from\s+["']redis["']/.test(texto) ||
      /import\(\s*["']redis["']\s*\)/.test(texto) ||
      /require\(\s*["']redis["']\s*\)/.test(texto)
    ) {
      ofensores.push(caminho);
    }
  }
  assert.deepEqual(ofensores, []);
});
