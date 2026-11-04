import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const compose = readFileSync(new URL("../docker-compose.yml", import.meta.url), "utf8");
const services = compose.split(/^services:\s*$/m)[1].split(/^[a-z]/m)[0];
const redis = services.split(/^  redis:\s*$/m)[1] ?? "";

test("RD-02 a imagem do redis é exatamente redis:8", () => {
  assert.match(redis, /^    image: redis:8\s*$/m);
  assert.doesNotMatch(redis, /redis:latest/);
  assert.doesNotMatch(redis, /redis:7/);
  assert.doesNotMatch(redis, /alpine/);
});

test("RD-03 publica a porta 6379 do host na porta 6379 do container", () => {
  const ports = redis.match(/^    ports:\n(?:      .*\n)*/m)?.[0] ?? "";
  assert.match(ports, /^    ports:\s*$/m);
  assert.match(ports, /^      - "6379:6379"\s*$/m);
});

test("RD-04 monta o volume catalogo_redis em /data", () => {
  assert.match(redis, /^      - catalogo_redis:\/data\s*$/m);
  assert.match(compose, /^  catalogo_redis:\s*$/m);
});

test("RD-05 usa restart unless-stopped", () => {
  assert.match(redis, /^    restart: unless-stopped\s*$/m);
});

test("RD-06 omite command, requirepass e REDIS_PASSWORD", () => {
  assert.doesNotMatch(redis, /^\s*command:/m);
  assert.doesNotMatch(redis, /requirepass/);
  assert.doesNotMatch(redis, /REDIS_PASSWORD/);
});

test("RD-07 checa a saúde com redis-cli ping", () => {
  assert.match(redis, /^      test: \["CMD", "redis-cli", "ping"\]\s*$/m);
  assert.match(redis, /^      interval: 5s\s*$/m);
  assert.match(redis, /^      timeout: 5s\s*$/m);
  assert.match(redis, /^      retries: 10\s*$/m);
  assert.match(redis, /^      start_period: 5s\s*$/m);
});
