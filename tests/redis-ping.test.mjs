import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { createClient } from "redis";

const blocker = new URL("../.specs/features/setup-redis/bloqueio-docker.md", import.meta.url);
const url = "redis://localhost:6379";

test("RD-19 PING devolve PONG", async () => {
  const client = createClient({ url });
  client.on("error", () => {});
  await client.connect();
  try {
    assert.equal(await client.ping(), "PONG");
  } finally {
    await client.disconnect();
  }
});

test("RD-20 com PONG o bloqueio está ausente", async () => {
  const client = createClient({ url });
  client.on("error", () => {});
  await client.connect();
  try {
    assert.equal(await client.ping(), "PONG");
    assert.equal(existsSync(blocker), false);
  } finally {
    await client.disconnect();
  }
});

test("RD-21 o teste de PING chama ping() e não inventa PONG", () => {
  const source = readFileSync(new URL("./redis-ping.test.mjs", import.meta.url), "utf8");
  const ping = source.split('test("RD-19')[1]?.split('test("RD-20')[0] ?? "";
  assert.match(ping, /ping\(\)/);
  assert.equal(ping.includes("catch"), false);
});
