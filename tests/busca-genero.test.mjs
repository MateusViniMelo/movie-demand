import assert from "node:assert/strict";
import test from "node:test";
import { formatarDuracao, urlDoPoster } from "../lib/cartaz.mjs";
import { executarBuscaPorGenero } from "../lib/busca.mjs";

test("gênero id inválido devolve ausente sem consultar", async () => {
  let chamou = false;
  const executor = () => {
    chamou = true;
    return Promise.resolve([]);
  };

  for (const generoId of [0, -1, 1.5, Number.NaN, "abc", null, undefined]) {
    chamou = false;
    const resultado = await executarBuscaPorGenero(executor, {
      generoId,
      pagina: 1,
      tamanho: 10,
    });
    assert.equal(resultado.estado, "ausente");
    assert.deepEqual(resultado.filmes, []);
    assert.equal(resultado.total, 0);
    assert.equal(resultado.pagina, 1);
    assert.equal(resultado.paginas, 0);
    assert.equal(Object.hasOwn(resultado, "genero"), false);
    assert.equal(chamou, false);
  }
});

test("gênero inexistente devolve ausente", async () => {
  const chamadas = [];
  const resultado = await executarBuscaPorGenero(
    async (sql, params) => {
      chamadas.push({ sql, params });
      return [];
    },
    { generoId: 999999, pagina: 1, tamanho: 10 },
  );

  assert.equal(resultado.estado, "ausente");
  assert.deepEqual(resultado.filmes, []);
  assert.equal(resultado.total, 0);
  assert.equal(resultado.pagina, 1);
  assert.equal(resultado.paginas, 0);
  assert.equal(Object.hasOwn(resultado, "genero"), false);
  assert.equal(chamadas.length, 1);
  assert.match(chamadas[0].sql, /FROM\s+generos/i);
  assert.deepEqual(chamadas[0].params, [999999]);
  assert.equal(/portuguese|to_tsvector|to_tsquery|ts_rank/i.test(chamadas[0].sql), false);
});

test("gênero sem filmes devolve nenhum com o gênero", async () => {
  const chamadas = [];
  const resultado = await executarBuscaPorGenero(
    async (sql, params) => {
      chamadas.push({ sql, params });
      if (/FROM\s+generos/i.test(sql)) return [{ id: 99, nome: "Documentário" }];
      if (/count\(/i.test(sql)) return [{ total: 0 }];
      throw new Error(`consulta inesperada: ${sql}`);
    },
    { generoId: 99, pagina: 3, tamanho: 10 },
  );

  assert.equal(resultado.estado, "nenhum");
  assert.deepEqual(resultado.filmes, []);
  assert.equal(resultado.total, 0);
  assert.equal(resultado.pagina, 1);
  assert.equal(resultado.paginas, 0);
  assert.deepEqual(resultado.genero, { id: 99, nome: "Documentário" });
  assert.equal(chamadas.length, 2);
  assert.match(chamadas[1].sql, /filme_generos/i);
  assert.equal(/portuguese|to_tsvector|to_tsquery|ts_rank/i.test(chamadas[1].sql), false);
  assert.deepEqual(chamadas[1].params, [99]);
});

test("gênero com filmes devolve ok, ficha e paginação do recorte", async () => {
  const chamadas = [];
  const resultado = await executarBuscaPorGenero(
    async (sql, params) => {
      chamadas.push({ sql, params });
      if (/FROM\s+generos/i.test(sql) && !/filme_generos/i.test(sql)) {
        return [{ id: 12, nome: "Aventura" }];
      }
      if (/count\(/i.test(sql)) return [{ total: 12 }];
      if (/LIMIT/i.test(sql)) {
        assert.match(sql, /filme_generos/i);
        assert.match(sql, /popularidade\s+DESC/i);
        assert.match(sql, /f\.id\s+ASC/i);
        assert.equal(/portuguese|to_tsvector|to_tsquery|ts_rank/i.test(sql), false);
        assert.deepEqual(params, [12, 5, 5]);
        return [
          {
            id: 100,
            titulo: "Filme A",
            duracao_min: 100,
            poster_path: "/a.jpg",
            backdrop_path: "/b.jpg",
            genero: "Ação",
          },
        ];
      }
      throw new Error(`consulta inesperada: ${sql}`);
    },
    { generoId: 12, pagina: 2, tamanho: 7 },
  );

  assert.equal(resultado.estado, "ok");
  assert.equal(resultado.total, 12);
  assert.equal(resultado.pagina, 2);
  assert.equal(resultado.paginas, 3);
  assert.deepEqual(resultado.genero, { id: 12, nome: "Aventura" });
  assert.equal(resultado.filmes.length, 1);
  assert.deepEqual(resultado.filmes[0], {
    id: 100,
    titulo: "Filme A",
    genero: "Ação",
    duracao: formatarDuracao(100),
    banner: urlDoPoster("/b.jpg", "w780"),
  });
  assert.equal(chamadas.length, 3);
});

test("página além da última e página inválida espelham o recorte", async () => {
  const resultadoAlta = await executarBuscaPorGenero(
    async (sql) => {
      if (/FROM\s+generos/i.test(sql) && !/filme_generos/i.test(sql)) {
        return [{ id: 28, nome: "Ação" }];
      }
      if (/count\(/i.test(sql)) return [{ total: 25 }];
      return [
        {
          id: 1,
          titulo: "Última",
          duracao_min: 90,
          poster_path: null,
          backdrop_path: null,
          genero: "Ação",
        },
      ];
    },
    { generoId: 28, pagina: 99, tamanho: 10 },
  );
  assert.equal(resultadoAlta.estado, "ok");
  assert.equal(resultadoAlta.pagina, 3);
  assert.equal(resultadoAlta.paginas, 3);

  const resultadoInvalida = await executarBuscaPorGenero(
    async (sql) => {
      if (/FROM\s+generos/i.test(sql) && !/filme_generos/i.test(sql)) {
        return [{ id: 28, nome: "Ação" }];
      }
      if (/count\(/i.test(sql)) return [{ total: 25 }];
      return [
        {
          id: 2,
          titulo: "Primeira",
          duracao_min: 90,
          poster_path: null,
          backdrop_path: null,
          genero: "Ação",
        },
      ];
    },
    { generoId: 28, pagina: 0, tamanho: 10 },
  );
  assert.equal(resultadoInvalida.pagina, 1);
  assert.equal(resultadoInvalida.paginas, 3);
});
