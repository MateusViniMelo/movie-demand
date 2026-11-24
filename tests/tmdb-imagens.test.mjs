import assert from "node:assert/strict";
import test from "node:test";
import {
  autenticacaoTmdb,
  carregarImagensTmdb,
  mapearImagensTmdb,
} from "../lib/tmdb-imagens.mjs";

test("autenticação prefere o read token e cai na api key", () => {
  assert.deepEqual(autenticacaoTmdb({ "READ_TOKEN_MOVIE-DB": " tok ", "API_KEY_MOVIE-DB": "k" }), {
    tipo: "bearer",
    valor: "tok",
  });
  assert.deepEqual(autenticacaoTmdb({ "API_KEY_MOVIE-DB": "chave" }), {
    tipo: "key",
    valor: "chave",
  });
  assert.equal(autenticacaoTmdb({}), null);
});

test("mapearImagensTmdb prioriza backdrops, depois pôsteres, sem duplicar e com teto", () => {
  const imagens = mapearImagensTmdb(
    {
      backdrops: [
        { file_path: "/b-baixa.jpg", vote_average: 1, vote_count: 1 },
        { file_path: "/b-alta.jpg", vote_average: 9, vote_count: 10 },
        { file_path: "/b-alta.jpg", vote_average: 8, vote_count: 2 },
      ],
      posters: [
        { file_path: "/p1.jpg", vote_average: 5, vote_count: 3 },
        { file_path: "/b-alta.jpg", vote_average: 7, vote_count: 1 },
      ],
    },
    "Batman",
  );
  assert.equal(imagens[0].src, "https://image.tmdb.org/t/p/w1280/b-alta.jpg");
  assert.equal(imagens[0].tipo, "fundo");
  assert.equal(imagens[0].alt, "Cena de Batman");
  assert.equal(imagens[0].chave, "/b-alta.jpg");
  assert.equal(imagens[1].src, "https://image.tmdb.org/t/p/w1280/b-baixa.jpg");
  assert.equal(imagens[2].src, "https://image.tmdb.org/t/p/w780/p1.jpg");
  assert.equal(imagens[2].tipo, "poster");
  assert.equal(imagens[2].alt, "Pôster de Batman");
  assert.equal(imagens.length, 3);
});

test("mapearImagensTmdb respeita o teto de 16", () => {
  const backdrops = Array.from({ length: 20 }, (_, i) => ({
    file_path: `/b${i}.jpg`,
    vote_average: 20 - i,
    vote_count: 1,
  }));
  assert.equal(mapearImagensTmdb({ backdrops, posters: [] }).length, 16);
});

test("carregarImagensTmdb usa Bearer e devolve o mapa; falha vira lista vazia", async () => {
  const chamadas = [];
  const fetchOk = async (url, init) => {
    chamadas.push({ url: String(url), init });
    return {
      ok: true,
      async json() {
        return { backdrops: [{ file_path: "/x.jpg", vote_average: 1, vote_count: 1 }], posters: [] };
      },
    };
  };
  const imagens = await carregarImagensTmdb(
    155,
    "Batman",
    { "READ_TOKEN_MOVIE-DB": "segredo" },
    fetchOk,
  );
  assert.equal(imagens.length, 1);
  assert.equal(imagens[0].alt, "Cena de Batman");
  assert.match(chamadas[0].url, /\/movie\/155\/images/);
  assert.match(chamadas[0].url, /include_image_language=pt%2Cnull%2Cen/);
  assert.equal(chamadas[0].init.headers.Authorization, "Bearer segredo");
  assert.equal(chamadas[0].init.next.revalidate, 86400);

  const vazia = await carregarImagensTmdb(155, "X", {}, fetchOk);
  assert.deepEqual(vazia, []);

  const fetchErro = async () => {
    throw new Error("rede");
  };
  assert.deepEqual(
    await carregarImagensTmdb(155, "X", { "API_KEY_MOVIE-DB": "k" }, fetchErro),
    [],
  );
});
