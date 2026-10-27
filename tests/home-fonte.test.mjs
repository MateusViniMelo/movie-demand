import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

test("DB-21 a home importa filmes de @/lib/filmes", () => {
  assert.match(page, /import \{[^}]*\bfilmes\b[^}]*\} from "@\/lib\/filmes"/);
});

test("DB-22 a home não importa o cliente Prisma", () => {
  assert.equal(page.includes("@/lib/prisma"), false);
  assert.equal(page.includes("generated/prisma"), false);
});
