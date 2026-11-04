import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const example = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
const envUrl = new URL("../.env", import.meta.url);

test("RD-08 .env.example contém a REDIS_URL local", () => {
  assert.match(example, /^REDIS_URL=redis:\/\/localhost:6379\s*$/m);
});

test("RD-09 .env local contém a REDIS_URL quando o arquivo existe", () => {
  if (!existsSync(envUrl)) {
    assert.equal(existsSync(envUrl), false);
    return;
  }
  const env = readFileSync(envUrl, "utf8");
  assert.match(env, /^REDIS_URL=redis:\/\/localhost:6379\s*$/m);
});
