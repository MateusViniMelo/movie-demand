import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const example = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
const ignore = readFileSync(new URL("../.gitignore", import.meta.url), "utf8");

test("DB-07 .env.example contém a DATABASE_URL local", () => {
  assert.match(
    example,
    /^DATABASE_URL=postgresql:\/\/catalogo:catalogo@localhost:5432\/catalogo\s*$/m,
  );
});

test("DB-09 o deploy da Vercel migra e semeia antes do build", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const vercel = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.equal(
    pkg.scripts["vercel-build"],
    "prisma generate && prisma migrate deploy && prisma db seed && next build",
  );
  assert.equal(vercel.buildCommand, "npm run vercel-build");
});

test("DB-08 .gitignore ignora .env* e reinclui .env.example", () => {
  const ignoreIndex = ignore.search(/^\.env\*$/m);
  const unignoreIndex = ignore.search(/^!\.env\.example$/m);
  assert.ok(ignoreIndex >= 0);
  assert.ok(unignoreIndex > ignoreIndex);
});
