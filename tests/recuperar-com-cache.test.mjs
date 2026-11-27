import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { criarArmazenamentoRedis } from "../lib/armazenamento-redis.mjs";
import { recuperarComCache } from "../lib/recuperar-com-cache.mjs";

function memoriaArmazenamento() {
  /** @type {Map<string, string>} */
  const dados = new Map();
  /** @type {Array<{ chave: string; valor: string; ttlSegundos: number }>} */
  const gravacoes = [];
  return {
    dados,
    gravacoes,
    async ler(chave) {
      return dados.has(chave) ? dados.get(chave) : null;
    },
    async gravar(chave, valor, ttlSegundos) {
      dados.set(chave, valor);
      gravacoes.push({ chave, valor, ttlSegundos });
    },
  };
}

test("CAC-01 miss chama o carregador uma vez, grava JSON com TTL e o segundo acesso é hit", async () => {
  const armazenamento = memoriaArmazenamento();
  let chamadas = 0;
  const carregar = async () => {
    chamadas += 1;
    return { id: 155, titulo: "Godfather" };
  };

  const primeiro = await recuperarComCache({
    chave: "filme:155",
    ttlSegundos: 300,
    carregar,
    armazenamento,
  });

  assert.deepEqual(primeiro, { valor: { id: 155, titulo: "Godfather" }, acerto: false });
  assert.equal(chamadas, 1);
  assert.equal(armazenamento.gravacoes.length, 1);
  assert.deepEqual(armazenamento.gravacoes[0], {
    chave: "filme:155",
    valor: '{"id":155,"titulo":"Godfather"}',
    ttlSegundos: 300,
  });

  const segundo = await recuperarComCache({
    chave: "filme:155",
    ttlSegundos: 300,
    carregar,
    armazenamento,
  });

  assert.deepEqual(segundo, { valor: { id: 155, titulo: "Godfather" }, acerto: true });
  assert.equal(chamadas, 1);
});

test("CAC-02 erro em ler cai no carregador e não estoura para o chamador", async () => {
  let chamadas = 0;
  const resultado = await recuperarComCache({
    chave: "filme:9",
    ttlSegundos: 60,
    carregar: async () => {
      chamadas += 1;
      return { id: 9 };
    },
    armazenamento: {
      async ler() {
        throw new Error("redis indisponível");
      },
      async gravar() {},
    },
  });

  assert.deepEqual(resultado, { valor: { id: 9 }, acerto: false });
  assert.equal(chamadas, 1);
});

test("CAC-03 erro em gravar ainda devolve o valor do carregador", async () => {
  let gravações = 0;
  const resultado = await recuperarComCache({
    chave: "vitrine:home",
    ttlSegundos: 120,
    carregar: async () => ["lista-a"],
    armazenamento: {
      async ler() {
        return null;
      },
      async gravar() {
        gravações += 1;
        throw new Error("falha no set");
      },
    },
  });

  assert.deepEqual(resultado, { valor: ["lista-a"], acerto: false });
  assert.equal(gravações, 1);
});

test("CAC-04 o armazenamento Redis conecta na primeira operação, não na criação", async () => {
  let conectou = 0;
  /** @type {string | null} */
  let ultimaChave = null;
  const cliente = {
    isOpen: false,
    async connect() {
      conectou += 1;
      this.isOpen = true;
    },
    async get(chave) {
      ultimaChave = chave;
      return null;
    },
    async set() {},
  };

  const armazenamento = criarArmazenamentoRedis(cliente);
  assert.equal(conectou, 0);

  await armazenamento.ler("filme:1");
  assert.equal(conectou, 1);
  assert.equal(ultimaChave, "movie-demand:filme:1");
});

test("CAC-05 falha em get ou set no Redis não estoura e o helper ainda responde", async () => {
  const cliente = {
    isOpen: true,
    async connect() {},
    async get() {
      throw new Error("timeout");
    },
    async set() {
      throw new Error("timeout");
    },
  };

  const armazenamento = criarArmazenamentoRedis(cliente);
  assert.equal(await armazenamento.ler("x"), null);
  await assert.doesNotReject(() => armazenamento.gravar("x", "{}", 10));

  let chamadas = 0;
  const resultado = await recuperarComCache({
    chave: "x",
    ttlSegundos: 10,
    carregar: async () => {
      chamadas += 1;
      return 42;
    },
    armazenamento,
  });

  assert.deepEqual(resultado, { valor: 42, acerto: false });
  assert.equal(chamadas, 1);
});

test("CAC-06 o módulo do armazenamento Redis não importa o cliente singleton", () => {
  const source = readFileSync(
    new URL("../lib/armazenamento-redis.mjs", import.meta.url),
    "utf8",
  );
  assert.equal(source.includes("@/lib/redis"), false);
  assert.equal(source.includes("./redis"), false);
  assert.equal(source.includes("connect("), true);
});