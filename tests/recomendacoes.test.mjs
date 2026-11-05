import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CHAVE_RECOMENDACAO,
  atenderRecomendacao,
  decidirRecomendacao,
  eventoAtualizaRecomendacao,
  filmeDaLinha,
  filmesDaResposta,
  lerArmazenamento,
  lerRecomendacao,
  partesDaNota,
  pedidoDaRecomendacao,
  pedidoSeHouver,
  recomendar,
  registrarClique,
} from "../lib/recomendacoes.mjs";

function memoria() {
  const itens = new Map();
  return {
    itens,
    setItem(chave, valor) {
      itens.set(chave, valor);
    },
    getItem(chave) {
      return itens.has(chave) ? itens.get(chave) : null;
    },
  };
}

function filme(parcial) {
  return {
    id: 1,
    titulo: "Filme",
    posterPath: "/p.jpg",
    colecaoId: null,
    votos: 0,
    notaMedia: 0,
    generos: [],
    elenco: [],
    ...parcial,
  };
}

test("REC-01 o clique grava o json do filme e substitui o anterior", () => {
  const armazenamento = memoria();
  registrarClique(armazenamento, 10);
  registrarClique(armazenamento, 155);
  assert.equal(armazenamento.itens.size, 1);
  assert.equal(
    armazenamento.getItem(CHAVE_RECOMENDACAO),
    '{"versao":1,"filmeId":155}',
  );
});

test("REC-02 gravação que lança não estoura", () => {
  assert.doesNotThrow(() =>
    registrarClique(
      {
        setItem() {
          throw new Error("privado");
        },
      },
      155,
    ),
  );
});

test("REC-03 valor ausente, inválido ou rejeitado é ausência", () => {
  assert.equal(lerRecomendacao(null), null);
  assert.equal(lerRecomendacao(""), null);
  assert.equal(lerRecomendacao("[]"), null);
  assert.equal(lerRecomendacao("{"), null);
  assert.equal(lerRecomendacao('{"versao":2,"filmeId":155}'), null);
  assert.equal(lerRecomendacao('{"versao":1}'), null);
  assert.equal(lerRecomendacao('{"versao":1,"filmeId":0}'), null);
  assert.equal(lerRecomendacao('{"versao":1,"filmeId":2147483648}'), null);
  assert.equal(lerRecomendacao('{"versao":1,"filmeId":155}'), 155);
});

test("REC-05 filme guardado pede a rota com o id", () => {
  assert.equal(pedidoSeHouver(null), null);
  assert.equal(pedidoDaRecomendacao(155), "/api/recomendacoes?filme=155");
  assert.equal(pedidoSeHouver(155), "/api/recomendacoes?filme=155");
  const componente = readFileSync(
    new URL("../components/recomendacoes.tsx", import.meta.url),
    "utf8",
  );
  const pagina = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const ramoVazio = pagina.slice(
    pagina.indexOf("fileira.filmes.length === 0"),
    pagina.indexOf("const listas"),
  );
  assert.match(ramoVazio, /<Recomendacoes \/>/);
  assert.match(componente, /pedidoSeHouver\(filmeId\)/);
  assert.match(componente, /fetch\(pedido\)/);
});

test("REC-07 status diferente de 200 não devolve filme", () => {
  const item = { id: 1, titulo: "Um", src: "https://image.tmdb.org/t/p/w500/p.jpg" };
  assert.deepEqual(filmesDaResposta(404, { filmes: [item] }), []);
  assert.deepEqual(filmesDaResposta(500, { filmes: [item] }), []);
  const componente = readFileSync(
    new URL("../components/recomendacoes.tsx", import.meta.url),
    "utf8",
  );
  assert.match(componente, /filmesDaResposta\(resposta\.status, corpo\)/);
});

test("REC-08 status 200 com lista vazia não devolve filme", () => {
  assert.deepEqual(filmesDaResposta(200, { filmes: [] }), []);
  assert.deepEqual(filmesDaResposta(200, null), []);
  assert.deepEqual(filmesDaResposta(200, { filmes: "x" }), []);
  assert.deepEqual(filmesDaResposta(200, { filmes: [{ id: 4, titulo: "Quatro", src: "/q" }] }), [
    { id: 4, titulo: "Quatro", src: "/q" },
  ]);
});

test("REC-11 a chave cineverso.recomendacao pede nova leitura", () => {
  assert.equal(eventoAtualizaRecomendacao(CHAVE_RECOMENDACAO), true);
  const componente = readFileSync(
    new URL("../components/recomendacoes.tsx", import.meta.url),
    "utf8",
  );
  assert.match(componente, /if \(eventoAtualizaRecomendacao\(evento\.key\)\) carregar\(\)/);
});

test("REC-12 outra chave de storage não pede leitura", () => {
  assert.equal(eventoAtualizaRecomendacao("tema"), false);
  assert.equal(eventoAtualizaRecomendacao(null), false);
});

test("REC-13 origem 1 e 2 com candidato 1, 1 e 3 vale 0.25 de gênero", () => {
  const partes = partesDaNota(
    filme({ generos: [1, 2] }),
    filme({ generos: [1, 1, 3] }),
  );
  assert.equal(partes.genero, 0.25);
  assert.equal(
    partesDaNota(filme({ generos: [1] }), filme({ generos: [1] })).genero,
    1,
  );
  assert.equal(
    partesDaNota(filme({ generos: [1, 2, 3] }), filme({ generos: [1] })).genero,
    1 / 3,
  );
});

test("REC-14 sem gênero a parte de gênero é 0", () => {
  assert.equal(
    partesDaNota(filme({ generos: [] }), filme({ generos: [1] })).genero,
    0,
  );
  assert.equal(
    partesDaNota(filme({ generos: [1] }), filme({ generos: [] })).genero,
    0,
  );
});

test("REC-15 coleção igual e não nula soma 0.3", () => {
  assert.equal(
    partesDaNota(filme({ colecaoId: 7 }), filme({ colecaoId: 7 })).colecao,
    0.3,
  );
});

test("REC-16 coleção nula soma 0", () => {
  assert.equal(
    partesDaNota(filme({ colecaoId: null }), filme({ colecaoId: null })).colecao,
    0,
  );
  assert.equal(
    partesDaNota(filme({ colecaoId: 7 }), filme({ colecaoId: null })).colecao,
    0,
  );
  assert.equal(
    partesDaNota(filme({ colecaoId: null }), filme({ colecaoId: 7 })).colecao,
    0,
  );
});

test("REC-17 elenco cruzado nos 5 primeiros soma 0.15", () => {
  const origem = filme({
    elenco: [
      { pessoaId: 1, ordem: 1 },
      { pessoaId: 2, ordem: 2 },
      { pessoaId: 3, ordem: 3 },
      { pessoaId: 4, ordem: 4 },
      { pessoaId: 5, ordem: 5 },
    ],
  });
  assert.equal(
    partesDaNota(origem, filme({ elenco: [{ pessoaId: 5, ordem: 1 }] })).elenco,
    0.15,
  );
});

test("REC-18 interseção vazia soma 0 de elenco", () => {
  const origem = filme({
    elenco: [1, 2, 3, 4, 5, 9].map((pessoaId, indice) => ({
      pessoaId,
      ordem: indice + 1,
    })),
  });
  assert.equal(
    partesDaNota(origem, filme({ elenco: [{ pessoaId: 9, ordem: 1 }] })).elenco,
    0,
  );
  assert.equal(partesDaNota(filme(), filme()).elenco, 0);
});

test("REC-19 o conjunto guarda a menor ordem e os 5 menores pessoaId", () => {
  const origem = filme({
    elenco: [
      { pessoaId: 7, ordem: 5 },
      { pessoaId: 7, ordem: 0 },
      { pessoaId: 1, ordem: 1 },
      { pessoaId: 2, ordem: 1 },
      { pessoaId: 3, ordem: 1 },
      { pessoaId: 4, ordem: 1 },
      { pessoaId: 8, ordem: 1 },
    ],
  });
  assert.equal(
    partesDaNota(origem, filme({ elenco: [{ pessoaId: 7, ordem: 4 }] })).elenco,
    0.15,
  );
  assert.equal(
    partesDaNota(origem, filme({ elenco: [{ pessoaId: 8, ordem: 0 }] })).elenco,
    0,
  );
  const mesmaOrdem = filme({
    elenco: [50, 40, 30, 20, 10, 1].map((pessoaId) => ({ pessoaId, ordem: 1 })),
  });
  assert.equal(
    partesDaNota(mesmaOrdem, filme({ elenco: [{ pessoaId: 1, ordem: 3 }] })).elenco,
    0.15,
  );
  assert.equal(
    partesDaNota(mesmaOrdem, filme({ elenco: [{ pessoaId: 50, ordem: 0 }] })).elenco,
    0,
  );
});

test("REC-20 elenco sozinho ou nota zero fica de fora", () => {
  const origem = filme({ id: 1, generos: [1], elenco: [{ pessoaId: 4, ordem: 1 }] });
  const soElenco = filme({
    id: 2,
    generos: [9],
    elenco: [{ pessoaId: 4, ordem: 1 }],
  });
  const nada = filme({ id: 3, generos: [8] });
  assert.deepEqual(
    recomendar(origem, [soElenco, nada]).map((item) => item.id),
    [],
  );
  const mesmaColecao = filme({ id: 9, generos: [8], colecaoId: 9 });
  assert.deepEqual(
    recomendar(filme({ id: 1, generos: [4], colecaoId: 9 }), [mesmaColecao]).map((item) => item.id),
    [9],
  );
});

test("REC-21 o filme de origem fica de fora", () => {
  const origem = filme({ id: 10, generos: [1] });
  const outro = filme({ id: 11, generos: [1] });
  assert.deepEqual(
    recomendar(origem, [origem, outro]).map((item) => item.id),
    [11],
  );
});

test("REC-22 pôster nulo ou vazio fica de fora", () => {
  const origem = filme({ id: 1, generos: [1] });
  const nulo = filme({ id: 2, generos: [1], posterPath: null });
  const vazio = filme({ id: 3, generos: [1], posterPath: "" });
  const comPoster = filme({ id: 4, generos: [1], posterPath: "/ok.jpg" });
  assert.deepEqual(
    recomendar(origem, [nulo, vazio, comPoster]).map((item) => item.id),
    [4],
  );
});

test("REC-23 no máximo 12, por nota, votos, notaMedia e id", () => {
  const origem = filme({ id: 100, generos: [1], colecaoId: 4 });
  const empatados = Array.from({ length: 13 }, (_, indice) =>
    filme({
      id: indice + 1,
      generos: [1],
      votos: 1,
      notaMedia: 1,
    }),
  );
  assert.deepEqual(
    recomendar(origem, empatados).map((item) => item.id),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  );

  const porChave = [
    filme({ id: 30, generos: [1], votos: 1, notaMedia: 9 }),
    filme({ id: 20, generos: [1], votos: 5, notaMedia: 1 }),
    filme({ id: 10, generos: [1], votos: 5, notaMedia: 9 }),
    filme({ id: 5, generos: [1], colecaoId: 4, votos: 0, notaMedia: 0 }),
  ];
  assert.deepEqual(
    recomendar(origem, porChave).map((item) => item.id),
    [5, 10, 20, 30],
  );
});

test("REC-24 filme que não é id responde 404", () => {
  for (const consulta of ["abc", "0", "01", "1.5", "-3", "", "2147483648"]) {
    const resposta = decidirRecomendacao(consulta, []);
    assert.equal(resposta.status, 404);
    assert.deepEqual(resposta.corpo, { filmes: [] });
  }
  const rota = readFileSync(new URL("../app/api/recomendacoes/route.ts", import.meta.url), "utf8");
  assert.match(rota, /searchParams\.get\("filme"\)/);
  assert.match(rota, /status:\s*resultado\.status/);
  assert.match(rota, /headers:\s*cabecalhoDaApi\(\)/);
  assert.match(rota, /carregarRecomendacoes\(filme\)/);
});

test("REC-25 filme ausente do catálogo responde 404", () => {
  const resposta = decidirRecomendacao("155", [filme({ id: 1 })]);
  assert.equal(resposta.status, 404);
  assert.deepEqual(resposta.corpo, { filmes: [] });
});

test("REC-26 filme sem candidato responde 200 e lista vazia", () => {
  const resposta = decidirRecomendacao("155", [filme({ id: 155, generos: [1] })]);
  assert.equal(resposta.status, 200);
  assert.deepEqual(resposta.corpo, { filmes: [] });
});

test("REC-27 o cartaz traz id, titulo e src w500, no máximo 12", () => {
  const origem = filme({ id: 1, titulo: "Origem", generos: [1] });
  const candidato = filme({
    id: 2,
    titulo: "Vizinho",
    posterPath: "/vizinho.jpg",
    generos: [1],
    votos: 3,
  });
  const mapeado = filmeDaLinha({
    id: 2,
    titulo: "Vizinho",
    posterPath: "/vizinho.jpg",
    colecaoId: null,
    votos: 3,
    notaMedia: 0,
    generos: [{ generoId: 1 }],
    elencos: [],
  });
  assert.equal(mapeado.posterPath, "/vizinho.jpg");
  assert.deepEqual(mapeado.generos, [1]);
  const resposta = decidirRecomendacao("1", [origem, candidato]);
  assert.equal(resposta.status, 200);
  assert.deepEqual(resposta.corpo.filmes, [
    {
      id: 2,
      titulo: "Vizinho",
      src: "https://image.tmdb.org/t/p/w500/vizinho.jpg",
    },
  ]);

  const muitos = [
    origem,
    ...Array.from({ length: 13 }, (_, indice) =>
      filme({ id: indice + 2, titulo: `F${indice + 2}`, generos: [1] }),
    ),
  ];
  assert.equal(decidirRecomendacao("1", muitos).corpo.filmes.length, 12);
  const banco = readFileSync(new URL("../lib/recomendacoes-db.ts", import.meta.url), "utf8");
  for (const campo of [
    "id: true",
    "titulo: true",
    "posterPath: true",
    "colecaoId: true",
    "votos: true",
    "notaMedia: true",
    "generoId: true",
    "pessoaId: true",
    "ordem: true",
  ]) {
    assert.equal(banco.includes(campo), true, campo);
  }
  assert.match(banco, /linhas\.map\(\(linha\) => filmeDaLinha\(linha\)\)/);
  assert.match(banco, /atenderRecomendacao\(consulta/);
});

test("REC-28 leitura que lança responde 500", async () => {
  const resposta = await atenderRecomendacao("155", async () => {
    throw new Error("banco");
  });
  assert.equal(resposta.status, 500);
  assert.deepEqual(resposta.corpo, { filmes: [] });
});

test("REC-29 leitura do armazenamento que lança é ausência", () => {
  assert.equal(
    lerArmazenamento({
      getItem() {
        throw new Error("privado");
      },
    }),
    null,
  );
  const armazenamento = memoria();
  registrarClique(armazenamento, 155);
  assert.equal(lerArmazenamento(armazenamento), 155);
  const componente = readFileSync(
    new URL("../components/recomendacoes.tsx", import.meta.url),
    "utf8",
  );
  assert.match(componente, /lerArmazenamento\(localStorage\)/);
  assert.match(componente, /if \(pedido === null\)/);
});
