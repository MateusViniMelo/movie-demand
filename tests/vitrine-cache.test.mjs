import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { montarVitrine } from "../lib/cartaz.mjs";
import {
  CHAVE_VITRINE_HOME,
  TTL_VITRINE_SEGUNDOS,
  recuperarVitrine,
} from "../lib/cache-vitrine.mjs";

function memoriaArmazenamento() {
  /** @type {Map<string, string>} */
  const dados = new Map();
  /** @type {Array<{ chave: string; valor: string; ttlSegundos: number }>} */
  const gravacoes = [];
  return {
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

const vitrineExemplo = montarVitrine([
  {
    slug: "upcoming",
    posicao: 1,
    id: 1,
    titulo: "A",
    sinopse: "Sinopse",
    duracaoMin: 90,
    posterPath: "/a.jpg",
    backdropPath: "/b.jpg",
    generos: ["Drama"],
  },
]);

test("VIT-CAC-01 miss grava a vitrine com TTL explícito e o segundo acesso é hit sem novo carregador", async () => {
  const armazenamento = memoriaArmazenamento();
  let chamadas = 0;

  const carregar = async () => {
    chamadas += 1;
    return vitrineExemplo;
  };

  const primeiro = await recuperarVitrine({ carregar, armazenamento });
  assert.deepEqual(primeiro, { valor: vitrineExemplo, acerto: false });
  assert.equal(chamadas, 1);
  assert.equal(armazenamento.gravacoes.length, 1);
  assert.equal(armazenamento.gravacoes[0].chave, CHAVE_VITRINE_HOME);
  assert.equal(armazenamento.gravacoes[0].ttlSegundos, TTL_VITRINE_SEGUNDOS);

  const segundo = await recuperarVitrine({ carregar, armazenamento });
  assert.deepEqual(segundo, { valor: vitrineExemplo, acerto: true });
  assert.equal(chamadas, 1);
});

test("VIT-CAC-02 falha no armazenamento ainda devolve a vitrine do Postgres", async () => {
  let chamadas = 0;
  const resultado = await recuperarVitrine({
    carregar: async () => {
      chamadas += 1;
      return vitrineExemplo;
    },
    armazenamento: {
      async ler() {
        throw new Error("redis indisponível");
      },
      async gravar() {
        throw new Error("redis indisponível");
      },
    },
  });

  assert.deepEqual(resultado, { valor: vitrineExemplo, acerto: false });
  assert.equal(chamadas, 1);
});

test("VIT-CAC-03 carregarVitrine usa o helper de cache e o TTL da vitrine", () => {
  const fonte = readFileSync(new URL("../lib/vitrine.ts", import.meta.url), "utf8");
  assert.match(fonte, /recuperarVitrine/);
  assert.match(fonte, /TTL_VITRINE_SEGUNDOS/);
  assert.match(fonte, /prisma\.listaFilme\.findMany/);
});

test("VIT-CAC-04 o TTL da vitrine é documentado como constante exportada", () => {
  const fonte = readFileSync(new URL("../lib/cache-vitrine.mjs", import.meta.url), "utf8");
  assert.match(fonte, /export const TTL_VITRINE_SEGUNDOS = \d+/);
  assert.ok(TTL_VITRINE_SEGUNDOS > 0);
});
