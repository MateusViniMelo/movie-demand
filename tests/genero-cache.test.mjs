import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  TTL_GENERO_SEGUNDOS,
  chaveCacheGenero,
  recuperarFilmesPorGeneroComCache,
} from "../lib/cache-genero.mjs";

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

const listagemExemplo = {
  estado: "ok",
  filmes: [
    {
      id: 155,
      titulo: "O Poderoso Chefão",
      genero: "Drama",
      duracao: "2h 55min",
      banner: "/b.jpg",
    },
  ],
  total: 1,
  pagina: 1,
  paginas: 1,
  generos: [{ id: 18, nome: "Drama" }],
};

test("GEN-CAC-01 chave estável para o mesmo conjunto de ids (ordem irrelevante) + página + tamanho", () => {
  assert.equal(
    chaveCacheGenero({ generoIds: [28, 12], pagina: 2, tamanho: 10 }),
    chaveCacheGenero({ generoIds: [12, 28], pagina: 2, tamanho: 10 }),
  );
  assert.equal(
    chaveCacheGenero({ generoIds: [12, 28], pagina: 1, tamanho: 10 }),
    chaveCacheGenero({ generoIds: [28, 12, 28], pagina: 1, tamanho: 10 }),
  );
  assert.notEqual(
    chaveCacheGenero({ generoIds: [12], pagina: 1, tamanho: 10 }),
    chaveCacheGenero({ generoIds: [12], pagina: 2, tamanho: 10 }),
  );
  assert.notEqual(
    chaveCacheGenero({ generoIds: [12], pagina: 1, tamanho: 10 }),
    chaveCacheGenero({ generoIds: [12], pagina: 1, tamanho: 20 }),
  );
});

test("GEN-CAC-02 miss grava com TTL nomeado e o segundo acesso é hit sem novo carregador", async () => {
  const armazenamento = memoriaArmazenamento();
  let chamadas = 0;
  const entrada = { generoIds: [18], pagina: 1, tamanho: 10 };

  const carregar = async () => {
    chamadas += 1;
    return listagemExemplo;
  };

  const primeiro = await recuperarFilmesPorGeneroComCache({
    ...entrada,
    carregar,
    armazenamento,
  });
  assert.deepEqual(primeiro, { valor: listagemExemplo, acerto: false });
  assert.equal(chamadas, 1);
  assert.equal(armazenamento.gravacoes.length, 1);
  assert.equal(armazenamento.gravacoes[0].chave, chaveCacheGenero(entrada));
  assert.equal(armazenamento.gravacoes[0].ttlSegundos, TTL_GENERO_SEGUNDOS);

  const segundo = await recuperarFilmesPorGeneroComCache({
    ...entrada,
    carregar,
    armazenamento,
  });
  assert.deepEqual(segundo, { valor: listagemExemplo, acerto: true });
  assert.equal(chamadas, 1);
});

test("GEN-CAC-03 falha no Redis ainda devolve o Postgres", async () => {
  let chamadas = 0;
  const resultado = await recuperarFilmesPorGeneroComCache({
    generoIds: [18],
    pagina: 1,
    tamanho: 10,
    carregar: async () => {
      chamadas += 1;
      return listagemExemplo;
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

  assert.deepEqual(resultado, { valor: listagemExemplo, acerto: false });
  assert.equal(chamadas, 1);
});

test("GEN-CAC-04 estado ausente não grava no cache", async () => {
  const armazenamento = memoriaArmazenamento();
  const ausente = {
    estado: "ausente",
    filmes: [],
    total: 0,
    pagina: 1,
    paginas: 0,
  };

  const resultado = await recuperarFilmesPorGeneroComCache({
    generoIds: [9_999_999],
    pagina: 1,
    tamanho: 10,
    carregar: async () => ausente,
    armazenamento,
  });

  assert.deepEqual(resultado, { valor: ausente, acerto: false });
  assert.equal(armazenamento.gravacoes.length, 0);
});

test("GEN-CAC-05 buscarFilmesPorGenero usa recuperarFilmesPorGeneroComCache na lib", () => {
  const fonte = readFileSync(new URL("../lib/busca-db.ts", import.meta.url), "utf8");
  assert.match(fonte, /recuperarFilmesPorGeneroComCache/);
  assert.match(fonte, /armazenamentoCacheRedis/);
  assert.match(fonte, /executarBuscaPorGenero/);
});

test("GEN-CAC-06 TTL do gênero é constante documentada", () => {
  assert.equal(TTL_GENERO_SEGUNDOS > 0, true);
  const fonte = readFileSync(new URL("../lib/cache-genero.mjs", import.meta.url), "utf8");
  assert.match(fonte, /export const TTL_GENERO_SEGUNDOS = \d+/);
  assert.match(fonte, /\/\*\*[\s\S]*TTL[\s\S]*\*\//);
});
