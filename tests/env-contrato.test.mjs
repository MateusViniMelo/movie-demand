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

test("DB-08 .gitignore ignora .env* e reinclui .env.example", () => {
  const ignoreIndex = ignore.search(/^\.env\*$/m);
  const unignoreIndex = ignore.search(/^!\.env\.example$/m);
  assert.ok(ignoreIndex >= 0);
  assert.ok(unignoreIndex > ignoreIndex);
});
