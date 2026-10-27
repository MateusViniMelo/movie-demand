import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const compose = readFileSync(new URL("../docker-compose.yml", import.meta.url), "utf8");
const services = compose.split(/^services:\s*$/m)[1].split(/^[a-z]/m)[0];

test("DB-01 declara só o serviço db na imagem postgres:17", () => {
  const names = [...services.matchAll(/^  ([a-z0-9_-]+):\s*$/gm)].map((match) => match[1]);
  assert.deepEqual(names, ["db"]);
  assert.match(services, /^    image: postgres:17\s*$/m);
});

test("DB-02 publica a porta 5432 do host na porta 5432 do container", () => {
  assert.match(services, /^      - "5432:5432"\s*$/m);
});

test("DB-03 monta o volume catalogo_pg em /var/lib/postgresql/data", () => {
  assert.match(services, /^      - catalogo_pg:\/var\/lib\/postgresql\/data\s*$/m);
  assert.match(compose, /^volumes:\n  catalogo_pg:\s*$/m);
});

test("DB-04 define usuário, senha e banco como catalogo", () => {
  assert.match(services, /^      POSTGRES_USER: catalogo\s*$/m);
  assert.match(services, /^      POSTGRES_PASSWORD: catalogo\s*$/m);
  assert.match(services, /^      POSTGRES_DB: catalogo\s*$/m);
});

test("DB-05 usa restart unless-stopped e shm_size 128mb", () => {
  assert.match(services, /^    restart: unless-stopped\s*$/m);
  assert.match(services, /^    shm_size: 128mb\s*$/m);
});

test("DB-06 checa a saúde no TCP com pg_isready", () => {
  assert.match(
    services,
    /^      test: \["CMD-SHELL", "pg_isready -h localhost -U catalogo -d catalogo"\]\s*$/m,
  );
  assert.match(services, /^      interval: 5s\s*$/m);
  assert.match(services, /^      timeout: 5s\s*$/m);
  assert.match(services, /^      retries: 10\s*$/m);
  assert.match(services, /^      start_period: 30s\s*$/m);
});
