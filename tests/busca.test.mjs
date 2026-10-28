import assert from "node:assert/strict";
import test from "node:test";
import { formatarDuracao, urlDoPoster } from "../lib/cartaz.mjs";
import {
  fichaDaBusca,
  recorte,
  textoDaBusca,
  tsqueryDaBusca,
  vetorSql,
} from "../lib/busca.mjs";

test("BUS-12 o vetor portuguese cobre título, título original e sinopse", () => {
  assert.equal(
    vetorSql,
    "to_tsvector('portuguese', titulo || ' ' || titulo_original || ' ' || sinopse)",
  );
  assert.equal(tsqueryDaBusca("hom"), "hom:*");
  assert.equal(tsqueryDaBusca("homem aranha"), "homem & aranha:*");
  assert.equal(tsqueryDaBusca("homem aranha um"), "homem & aranha & um:*");
});

test("BUS-13 gênero e duração ficam fora do vetor", () => {
  assert.equal(/genero|gênero|duracao|duração|duracao_min/i.test(vetorSql), false);
});

test("BUS-16 o banner é o backdrop, o pôster ou nada", () => {
  const comBackdrop = fichaDaBusca({
    id: 1,
    titulo: "Com fundo",
    backdrop_path: "/fundo.jpg",
    poster_path: "/poster.jpg",
    genero: "Drama",
    duracao_min: 90,
  });
  assert.equal(comBackdrop.banner, urlDoPoster("/fundo.jpg", "w780"));

  const soPoster = fichaDaBusca({
    id: 2,
    titulo: "Só pôster",
    backdrop_path: "",
    poster_path: "/poster.jpg",
    genero: "Drama",
    duracao_min: 90,
  });
  assert.equal(soPoster.banner, urlDoPoster("/poster.jpg", "w500"));

  const semImagem = fichaDaBusca({
    id: 3,
    titulo: "Sem imagem",
    backdrop_path: null,
    poster_path: null,
    genero: "Drama",
    duracao_min: 90,
  });
  assert.equal(semImagem.banner, null);
});

test("BUS-17 duração zero e gênero vazio somem da ficha", () => {
  const semPartes = fichaDaBusca({
    id: 4,
    titulo: "Sem meta",
    backdrop_path: "/fundo.jpg",
    poster_path: "/poster.jpg",
    genero: "   ",
    duracao_min: 0,
  });
  assert.equal(semPartes.genero, null);
  assert.equal(semPartes.duracao, null);
  assert.deepEqual(Object.keys(semPartes).sort(), ["banner", "duracao", "genero", "id", "titulo"]);

  const comDuracao = fichaDaBusca({
    id: 5,
    titulo: "Com duração",
    genero: "Aventura",
    duracao_min: 143,
  });
  assert.equal(comDuracao.genero, "Aventura");
  assert.equal(comDuracao.duracao, formatarDuracao(143));
});

test("BUS-19 texto além de 80 usa os 80 primeiros e só deixa letra ou número", () => {
  assert.equal(textoDaBusca(`${"a".repeat(80)}ZZZ`), "a".repeat(80));
  assert.equal(textoDaBusca(`${"!".repeat(3)}${"b".repeat(80)}`), "b".repeat(77));
  assert.equal(textoDaBusca("  hom & aranha!  "), "hom aranha");
  assert.equal(textoDaBusca("   "), "");
});

test("BUS-21 pagina que não é inteiro maior que zero vira 1", () => {
  assert.equal(recorte(25, 0, 10).pagina, 1);
  assert.equal(recorte(25, -4, 10).pagina, 1);
  assert.equal(recorte(25, 1.5, 10).pagina, 1);
  assert.equal(recorte(25, Number.NaN, 10).pagina, 1);
  assert.equal(recorte(25, 2, 10).pagina, 2);
  assert.equal(recorte(25, 2, 10).offset, 10);
});

test("BUS-09 pagina além da última volta para a última que existe", () => {
  const corte = recorte(25, 9, 10);
  assert.equal(corte.pagina, 3);
  assert.equal(corte.paginas, 3);
  assert.equal(corte.offset, 20);
  assert.equal(corte.tamanho, 10);
  assert.equal(recorte(0, 4, 10).pagina, 1);
  assert.equal(recorte(0, 4, 10).paginas, 0);
});

test("BUS-22 tamanho diferente de 5 e de 10 vira 5", () => {
  assert.equal(recorte(12, 1, 7).tamanho, 5);
  assert.equal(recorte(12, 1, 0).tamanho, 5);
  assert.equal(recorte(12, 1, 5).tamanho, 5);
  assert.equal(recorte(12, 1, 10).tamanho, 10);
});
