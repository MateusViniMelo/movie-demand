import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import pg from "pg";
import { urlDoPoster } from "../lib/cartaz.mjs";
import { caminhoDoFilme, fichaDoFilme, idDoFilme } from "../lib/filme.mjs";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const databaseUrl = env
  .split("\n")
  .find((line) => line.startsWith("DATABASE_URL="))
  ?.slice("DATABASE_URL=".length)
  .trim();

test("PAG-04 backdrop não vazio vira still w1280 e o título da linha", async () => {
  const ficha = fichaDoFilme({
    titulo: "O Farol",
    posterPath: "/poster.jpg",
    backdropPath: "/fundo.jpg",
  });
  assert.equal(ficha.titulo, "O Farol");
  assert.equal(ficha.fundo, "https://image.tmdb.org/t/p/w1280/fundo.jpg");
  assert.equal(caminhoDoFilme(155), "/filme/155");

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const rows = await client.query(
      "SELECT titulo, poster_path, backdrop_path FROM filmes WHERE id = 969681",
    );
    const linha = rows.rows[0];
    const semeada = fichaDoFilme({
      titulo: linha.titulo,
      posterPath: linha.poster_path,
      backdropPath: linha.backdrop_path,
    });
    assert.equal(semeada.titulo, "Homem-Aranha: Um Novo Dia");
    assert.equal(semeada.fundo, urlDoPoster(linha.backdrop_path, "w1280"));
    assert.equal(linha.backdrop_path.startsWith("/"), true);
  } finally {
    await client.end();
  }
});

test("PAG-05 sem backdrop o still é o pôster w1280", () => {
  const nulo = fichaDoFilme({
    titulo: "Sem fundo",
    posterPath: "/poster.jpg",
    backdropPath: null,
  });
  assert.equal(nulo.titulo, "Sem fundo");
  assert.equal(nulo.fundo, "https://image.tmdb.org/t/p/w1280/poster.jpg");

  const vazio = fichaDoFilme({
    titulo: "Sem fundo",
    posterPath: "/poster.jpg",
    backdropPath: "",
  });
  assert.equal(vazio.fundo, "https://image.tmdb.org/t/p/w1280/poster.jpg");
});

test("PAG-06 sem backdrop e sem pôster o fundo é nulo e o título fica", () => {
  const nulos = fichaDoFilme({
    titulo: "Só o nome",
    posterPath: null,
    backdropPath: null,
  });
  assert.equal(nulos.titulo, "Só o nome");
  assert.equal(nulos.fundo, null);

  const vazios = fichaDoFilme({
    titulo: "Só o nome",
    posterPath: "",
    backdropPath: "",
  });
  assert.equal(vazios.titulo, "Só o nome");
  assert.equal(vazios.fundo, null);
});

test("a leitura pede só id, título, pôster e backdrop", () => {
  const fonte = readFileSync(new URL("../lib/filme-db.ts", import.meta.url), "utf8");
  assert.match(fonte, /prisma\.filme\.findUnique/);
  assert.match(fonte, /where:\s*\{\s*id\s*\}/);
  const select = fonte.slice(fonte.indexOf("select:"));
  assert.match(select, /id:\s*true/);
  assert.match(select, /titulo:\s*true/);
  assert.match(select, /posterPath:\s*true/);
  assert.match(select, /backdropPath:\s*true/);
  for (const campo of ["sinopse", "genero", "duracao", "elenco", "nota", "trailer", "player"]) {
    assert.equal(select.includes(campo), false, campo);
  }
});

test("PAG-08 id fora do catálogo não é inteiro positivo seguro", () => {
  assert.equal(idDoFilme("155"), 155);
  assert.equal(idDoFilme("969681"), 969681);
  assert.equal(idDoFilme("0"), null);
  assert.equal(idDoFilme("01"), null);
  assert.equal(idDoFilme("1.5"), null);
  assert.equal(idDoFilme("-3"), null);
  assert.equal(idDoFilme("abc"), null);
  assert.equal(idDoFilme(""), null);
  assert.equal(idDoFilme(" 12"), null);
  assert.equal(idDoFilme("9007199254740993"), null);
  assert.equal(idDoFilme("2147483647"), 2147483647);
  assert.equal(idDoFilme("2147483648"), null);
});
