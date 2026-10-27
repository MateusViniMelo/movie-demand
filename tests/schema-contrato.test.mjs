import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
const config = readFileSync(new URL("../prisma.config.ts", import.meta.url), "utf8");
const ignore = readFileSync(new URL("../.gitignore", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

test("DB-09 gera o client em generated/prisma com prisma-client", () => {
  const generator = schema.match(/generator client \{[^}]*\}/s)?.[0] ?? "";
  assert.match(generator, /provider\s*=\s*"prisma-client"/);
  assert.match(generator, /output\s*=\s*"\.\.\/generated\/prisma"/);
  assert.match(ignore, /^\/generated\/prisma\/$/m);
});

test("DB-10 o datasource é postgresql e não guarda a URL", () => {
  const datasource = schema.match(/datasource db \{[^}]*\}/s)?.[0] ?? "";
  assert.match(datasource, /provider\s*=\s*"postgresql"/);
  assert.equal(datasource.includes("url"), false);
});

test("DB-11 prisma.config.ts lê DATABASE_URL com dotenv", () => {
  assert.match(config, /import "dotenv\/config"/);
  assert.match(config, /datasource:\s*\{[^}]*url:\s*env\("DATABASE_URL"\)/s);
});

test("DB-12 o model Filme mapeia as colunas de lib/filmes.ts", () => {
  const model = schema.match(/model Filme \{[^}]*\}/s)?.[0] ?? "";
  assert.match(model, /@@map\("filmes"\)/);
  assert.match(model, /id\s+Int(?!\?)\s+@id\b/);
  assert.equal(model.includes("autoincrement"), false);
  assert.match(model, /titulo\s+String(?!\?)/);
  assert.match(model, /descricao\s+String(?!\?)/);
  assert.match(model, /genero\s+String(?!\?)/);
  assert.match(model, /duracaoMin\s+Int(?!\?)\s+@map\("duracao_min"\)/);
  assert.match(model, /urlMidia\s+String(?!\?)\s+@map\("url_midia"\)/);
  assert.match(model, /origem\s+Origem(?!\?)/);
  assert.match(model, /tags\s+String\[\](?!\?)/);
  assert.equal(/model Tag \{/.test(schema), false);
});

test("DB-13 o enum Origem tem só real e sintetica", () => {
  const enumeration = schema.match(/enum Origem \{[^}]*\}/s)?.[0] ?? "";
  const values = [...enumeration.matchAll(/^\s*([A-Za-z]+)\s*$/gm)].map((match) => match[1]);
  assert.deepEqual(values, ["real", "sintetica"]);
});

test("DB-16 os scripts sobem o banco e geram o client antes do build", () => {
  assert.equal(pkg.scripts["db:up"], "docker compose up -d");
  assert.equal(pkg.scripts["db:down"], "docker compose down");
  assert.equal(pkg.scripts.build, "prisma generate && next build");
  assert.equal(pkg.scripts.postinstall, "prisma generate");
});
