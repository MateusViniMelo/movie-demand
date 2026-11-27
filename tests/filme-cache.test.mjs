import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  TTL_FICHA_SEGUNDOS,
  chaveCacheFilme,
  recuperarFilmeComCache,
} from "../lib/cache-ficha.mjs";

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

const filmeExemplo = {
  id: 155,
  titulo: "O Poderoso Chefão",
  elencos: [
    {
      personagem: "Vito Corleone",
      ordem: 0,
      pessoaId: 1,
      pessoa: { nome: "Marlon Brando", fotoPath: "/m.jpg" },
    },
  ],
};

test("FIC-01 miss grava a ficha com elenco, TTL explícito e o segundo acesso é hit", async () => {
  const armazenamento = memoriaArmazenamento();
  let chamadas = 0;

  const primeiro = await recuperarFilmeComCache(155, {
    armazenamento,
    carregar: async () => {
      chamadas += 1;
      return filmeExemplo;
    },
  });

  assert.deepEqual(primeiro, filmeExemplo);
  assert.equal(chamadas, 1);
  assert.equal(armazenamento.gravacoes.length, 1);
  assert.equal(armazenamento.gravacoes[0].chave, chaveCacheFilme(155));
  assert.equal(armazenamento.gravacoes[0].ttlSegundos, TTL_FICHA_SEGUNDOS);
  assert.match(armazenamento.gravacoes[0].valor, /"elencos"/);

  const segundo = await recuperarFilmeComCache(155, {
    armazenamento,
    carregar: async () => {
      chamadas += 1;
      return filmeExemplo;
    },
  });

  assert.deepEqual(segundo, filmeExemplo);
  assert.equal(chamadas, 1);
});

test("FIC-02 filme ausente devolve null e não grava no cache", async () => {
  const armazenamento = memoriaArmazenamento();
  let chamadas = 0;

  const resultado = await recuperarFilmeComCache(9_999_999, {
    armazenamento,
    carregar: async () => {
      chamadas += 1;
      return null;
    },
  });

  assert.equal(resultado, null);
  assert.equal(chamadas, 1);
  assert.equal(armazenamento.gravacoes.length, 0);
});

test("FIC-03 falha no Redis ainda devolve o Postgres", async () => {
  let chamadas = 0;
  const resultado = await recuperarFilmeComCache(42, {
    carregar: async () => {
      chamadas += 1;
      return { id: 42, titulo: "Resposta", elencos: [] };
    },
    armazenamento: {
      async ler() {
        throw new Error("redis fora");
      },
      async gravar() {
        throw new Error("redis fora");
      },
    },
  });

  assert.deepEqual(resultado, { id: 42, titulo: "Resposta", elencos: [] });
  assert.equal(chamadas, 1);
});

test("FIC-04 carregarFilme usa recuperarFilmeComCache na lib", () => {
  const fonte = readFileSync(new URL("../lib/filme-db.ts", import.meta.url), "utf8");
  assert.match(fonte, /recuperarFilmeComCache/);
  assert.match(fonte, /armazenamentoCacheRedis/);
  assert.match(fonte, /prisma\.filme\.findUnique/);
  assert.match(fonte, /elencos:\s*\{/);
});

test("FIC-05 TTL da ficha é constante documentada", () => {
  assert.equal(TTL_FICHA_SEGUNDOS > 0, true);
  const fonte = readFileSync(new URL("../lib/cache-ficha.mjs", import.meta.url), "utf8");
  assert.match(fonte, /TTL_FICHA_SEGUNDOS/);
  assert.match(fonte, /\/\*\*[\s\S]*TTL[\s\S]*\*\//);
});