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

test("a leitura pede still, meta, sinopse, trailerUrl e elencos (sem player/dump)", () => {
  const fonte = readFileSync(new URL("../lib/filme-db.ts", import.meta.url), "utf8");
  assert.match(fonte, /prisma\.filme\.findUnique/);
  assert.match(fonte, /where:\s*\{\s*id\s*\}/);
  const select = fonte.slice(fonte.indexOf("select:"));
  assert.match(select, /id:\s*true/);
  assert.match(select, /titulo:\s*true/);
  assert.match(select, /posterPath:\s*true/);
  assert.match(select, /backdropPath:\s*true/);
  assert.match(select, /dataLancamento:\s*true/);
  assert.match(select, /duracaoMin:\s*true/);
  assert.match(select, /notaMedia:\s*true/);
  assert.match(select, /votos:\s*true/);
  assert.match(select, /sinopse:\s*true/);
  assert.match(select, /trailerUrl:\s*true/);
  assert.match(select, /generos:\s*\{\s*select:\s*\{\s*genero:\s*\{\s*select:\s*\{\s*nome:\s*true/);
  assert.match(select, /elencos:\s*\{/);
  assert.match(select, /personagem:\s*true/);
  assert.match(select, /ordem:\s*true/);
  assert.match(select, /pessoaId:\s*true/);
  assert.match(select, /pessoa:\s*\{\s*select:\s*\{\s*nome:\s*true/);
  for (const campo of [
    "player",
    "orcamento",
    "receita",
    "tagline",
    "popularidade",
    "homepage",
    "empresas",
    "softcore",
    "tituloOriginal",
  ]) {
    assert.equal(select.includes(campo), false, campo);
  }
});

test("PAG-16 a ficha expõe a sinopse do catálogo e omite vazia", () => {
  const comTexto = fichaDoFilme({
    titulo: "O Farol",
    sinopse: "  Dois faroleiros numa ilha remota.  ",
  });
  assert.equal(comTexto.sinopse, "Dois faroleiros numa ilha remota.");

  const vazia = fichaDoFilme({
    titulo: "Sem texto",
    sinopse: "   ",
  });
  assert.equal(vazia.sinopse, "");

  const ausente = fichaDoFilme({
    titulo: "Sem campo",
  });
  assert.equal(ausente.sinopse, "");
});

test("PAG-18 a ficha expõe URL e embed do trailer ou null", () => {
  const comTrailer = fichaDoFilme({
    titulo: "Batman",
    trailerUrl: "https://www.youtube.com/watch?v=oFJ7Yry2p18",
  });
  assert.equal(comTrailer.trailerUrl, "https://www.youtube.com/watch?v=oFJ7Yry2p18");
  assert.equal(
    comTrailer.trailerEmbed,
    "https://www.youtube-nocookie.com/embed/oFJ7Yry2p18",
  );

  const curto = fichaDoFilme({
    titulo: "Curto",
    trailerUrl: "https://youtu.be/bwt2-nyEP0A",
  });
  assert.equal(curto.trailerEmbed, "https://www.youtube-nocookie.com/embed/bwt2-nyEP0A");

  const nulo = fichaDoFilme({ titulo: "Sem trailer", trailerUrl: null });
  assert.equal(nulo.trailerUrl, null);
  assert.equal(nulo.trailerEmbed, null);

  const ausente = fichaDoFilme({ titulo: "Sem campo" });
  assert.equal(ausente.trailerUrl, null);
  assert.equal(ausente.trailerEmbed, null);

  const vazio = fichaDoFilme({ titulo: "Vazio", trailerUrl: "" });
  assert.equal(vazio.trailerUrl, null);
  assert.equal(vazio.trailerEmbed, null);

  const espacos = fichaDoFilme({ titulo: "Espaços", trailerUrl: "   " });
  assert.equal(espacos.trailerUrl, null);
  assert.equal(espacos.trailerEmbed, null);

  const invalido = fichaDoFilme({
    titulo: "Inválido",
    trailerUrl: "https://example.com/watch?v=abc",
  });
  assert.equal(invalido.trailerUrl, "https://example.com/watch?v=abc");
  assert.equal(invalido.trailerEmbed, null);
});

test("PAG-14 a meta junta ano, duração, gêneros e nota com ·", () => {
  const ficha = fichaDoFilme({
    titulo: "O Farol",
    posterPath: "/poster.jpg",
    backdropPath: "/fundo.jpg",
    dataLancamento: new Date("2019-10-18T00:00:00.000Z"),
    duracaoMin: 109,
    notaMedia: 7.5,
    votos: 1200,
    generos: [{ genero: { nome: "Terror" } }, { genero: { nome: "Drama" } }],
  });
  assert.equal(ficha.meta, "2019 · 1 h e 49 min · Terror · Drama · 7,5");
});

test("PAG-15 a meta omite partes inválidas e só separa o que existe", () => {
  const semGeneros = fichaDoFilme({
    titulo: "X",
    dataLancamento: new Date("2024-01-01T00:00:00.000Z"),
    duracaoMin: 90,
    notaMedia: 8,
    votos: 10,
    generos: [],
  });
  assert.equal(semGeneros.meta, "2024 · 1 h e 30 min · 8,0");

  const soTitulo = fichaDoFilme({
    titulo: "Vazio",
    dataLancamento: null,
    duracaoMin: 0,
    notaMedia: 0,
    votos: 0,
    generos: [{ genero: { nome: "" } }, { genero: { nome: "   " } }],
  });
  assert.equal(soTitulo.meta, "");

  const semNota = fichaDoFilme({
    titulo: "Sem votos",
    dataLancamento: new Date("2020-05-01T00:00:00.000Z"),
    duracaoMin: 100,
    notaMedia: 9.1,
    votos: 0,
    generos: [{ genero: { nome: "Ação" } }],
  });
  assert.equal(semNota.meta, "2020 · 1 h e 40 min · Ação");

  const notaInutil = fichaDoFilme({
    titulo: "Nota inválida",
    dataLancamento: new Date("2021-01-01T00:00:00.000Z"),
    duracaoMin: 80,
    notaMedia: Number.NaN,
    votos: 5,
    generos: [{ genero: { nome: "Drama" } }],
  });
  assert.equal(notaInutil.meta, "2021 · 1 h e 20 min · Drama");

  const anoInvalido = fichaDoFilme({
    titulo: "Sem ano",
    dataLancamento: new Date("invalid"),
    duracaoMin: 45,
    notaMedia: 6,
    votos: 1,
    generos: [{ genero: { nome: "Suspense" } }],
  });
  assert.equal(anoInvalido.meta, "45 min · Suspense · 6,0");
});

test("PAG-19 o elenco principal ordena por ordem, desempata por pessoaId e corta em 8", () => {
  const ficha = fichaDoFilme({
    titulo: "O Farol",
    elencos: [
      { pessoaId: 20, ordem: 2, personagem: "Wake", pessoa: { nome: "Willem Dafoe" } },
      { pessoaId: 10, ordem: 1, personagem: "Winslow", pessoa: { nome: "Robert Pattinson" } },
      { pessoaId: 5, ordem: 1, personagem: "Extra", pessoa: { nome: "Antes no empate" } },
      { pessoaId: 31, ordem: 9, personagem: "Nove", pessoa: { nome: "Fora do teto" } },
      { pessoaId: 32, ordem: 3, personagem: "Três", pessoa: { nome: "A" } },
      { pessoaId: 33, ordem: 4, personagem: "Quatro", pessoa: { nome: "B" } },
      { pessoaId: 34, ordem: 5, personagem: "Cinco", pessoa: { nome: "C" } },
      { pessoaId: 35, ordem: 6, personagem: "Seis", pessoa: { nome: "D" } },
      { pessoaId: 36, ordem: 7, personagem: "Sete", pessoa: { nome: "E" } },
      { pessoaId: 37, ordem: 8, personagem: "Oito", pessoa: { nome: "F" } },
    ],
  });
  assert.deepEqual(ficha.elenco, [
    { pessoaId: 5, nome: "Antes no empate", personagem: "Extra" },
    { pessoaId: 10, nome: "Robert Pattinson", personagem: "Winslow" },
    { pessoaId: 20, nome: "Willem Dafoe", personagem: "Wake" },
    { pessoaId: 32, nome: "A", personagem: "Três" },
    { pessoaId: 33, nome: "B", personagem: "Quatro" },
    { pessoaId: 34, nome: "C", personagem: "Cinco" },
    { pessoaId: 35, nome: "D", personagem: "Seis" },
    { pessoaId: 36, nome: "E", personagem: "Sete" },
  ]);
  assert.equal(ficha.elenco.length, 8);
  assert.equal(
    ficha.elenco.some((pessoa) => pessoa.nome === "Fora do teto" || pessoa.nome === "F"),
    false,
  );
});

test("PAG-20 sem linhas de elenco a ficha devolve lista vazia", () => {
  assert.deepEqual(fichaDoFilme({ titulo: "Vazio" }).elenco, []);
  assert.deepEqual(fichaDoFilme({ titulo: "Vazio", elencos: [] }).elenco, []);
  assert.deepEqual(
    fichaDoFilme({
      titulo: "Só nome em branco",
      elencos: [{ pessoaId: 1, ordem: 0, personagem: "X", pessoa: { nome: "   " } }],
    }).elenco,
    [],
  );
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
