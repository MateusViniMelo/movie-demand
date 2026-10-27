import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../lib/prisma.ts", import.meta.url), "utf8");

test("DB-14 exporta um único prisma com PrismaPg e DATABASE_URL", () => {
  const exports = [...source.matchAll(/export const (\w+)/g)].map((match) => match[1]);
  assert.deepEqual(exports, ["prisma"]);
  assert.match(source, /new PrismaPg\(\{\s*connectionString: process\.env\.DATABASE_URL,?\s*\}\)/s);
  assert.match(source, /new PrismaClient\(\{\s*adapter\s*,?\s*\}\)/);
});

test("DB-15 guarda o cliente em globalThis fora de production", () => {
  assert.match(source, /globalThis/);
  assert.match(source, /process\.env\.NODE_ENV !== "production"/);
  assert.match(source, /globalForPrisma\.prisma = prisma/);
});
