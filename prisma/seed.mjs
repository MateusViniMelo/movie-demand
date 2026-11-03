// SPEC_DEVIATION: the seed writes with `pg` instead of PrismaClient.
// Reason: generated/prisma/client.ts imports extensionless TypeScript, which `node prisma/seed.mjs` cannot load.

import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import pg from "pg";

const LISTAS = ["popular", "now_playing", "upcoming", "top_rated"];

export function carregarCatalogo(raiz) {
  const generos = JSON.parse(readFileSync(path.join(raiz, "generos.json"), "utf8")).genres;
  const generoIds = new Set(generos.map((genero) => genero.id));
  const filmes = new Map();
  const colecoes = new Map();
  const posicoes = [];

  for (const slug of LISTAS) {
    const data = JSON.parse(readFileSync(path.join(raiz, `${slug}.json`), "utf8"));
    if (!Array.isArray(data.results) || data.results.length !== 20) {
      throw new Error(`lista ${slug} precisa ter 20 filmes`);
    }
    data.results.forEach((filme, index) => {
      for (const genero of filme.genres ?? []) {
        if (!generoIds.has(genero.id)) {
          throw new Error(`genero ${genero.id} não está no catálogo`);
        }
      }
      const elencoPath = path.join(raiz, "elenco", `${filme.id}.json`);
      if (!existsSync(elencoPath)) {
        throw new Error(`elenco/${filme.id}.json ausente`);
      }
      if (!filmes.has(filme.id)) {
        const elenco = JSON.parse(readFileSync(elencoPath, "utf8"));
        if (!Array.isArray(elenco.cast)) {
          throw new Error(`elenco/${filme.id}.json ausente`);
        }
        filmes.set(filme.id, { filme, cast: elenco.cast });
      }
      if (filme.belongs_to_collection && !colecoes.has(filme.belongs_to_collection.id)) {
        colecoes.set(filme.belongs_to_collection.id, filme.belongs_to_collection);
      }
      posicoes.push({ slug, filmeId: filme.id, posicao: index + 1 });
    });
  }

  const pessoas = new Map();
  const creditos = [];
  for (const { filme, cast } of filmes.values()) {
    for (const credito of cast) {
      if (!pessoas.has(credito.id)) pessoas.set(credito.id, credito);
      creditos.push({ filmeId: filme.id, credito });
    }
  }

  return { generos, colecoes: [...colecoes.values()], filmes: [...filmes.values()], pessoas: [...pessoas.values()], creditos, posicoes };
}

async function insertMany(client, table, columns, rows, casts = []) {
  for (let offset = 0; offset < rows.length; offset += 200) {
    const slice = rows.slice(offset, offset + 200);
    const values = [];
    const tuples = slice.map((row) => {
      const marks = row.map((value, column) => {
        values.push(value);
        const mark = `$${values.length}`;
        return casts[column] ? `${mark}::${casts[column]}` : mark;
      });
      return `(${marks.join(", ")})`;
    });
    await client.query(
      `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${tuples.join(", ")}`,
      values,
    );
  }
}

export async function semear(client, raiz) {
  const catalogo = carregarCatalogo(raiz);
  await client.query("BEGIN");
  try {
    await client.query("DELETE FROM lista_filmes");
    await client.query("DELETE FROM elenco");
    await client.query("DELETE FROM filme_generos");
    await client.query("DELETE FROM filmes");
    await client.query("DELETE FROM pessoas");
    await client.query("DELETE FROM colecoes");
    await client.query("DELETE FROM generos");
    await client.query("DELETE FROM listas");

    await insertMany(client, "listas", ["slug"], LISTAS.map((slug) => [slug]));
    await insertMany(
      client,
      "generos",
      ["id", "nome"],
      catalogo.generos.map((genero) => [genero.id, genero.name]),
    );
    await insertMany(
      client,
      "colecoes",
      ["id", "nome", "poster_path", "backdrop_path"],
      catalogo.colecoes.map((colecao) => [colecao.id, colecao.name, colecao.poster_path, colecao.backdrop_path]),
    );
    await insertMany(
      client,
      "filmes",
      [
        "id",
        "titulo",
        "titulo_original",
        "sinopse",
        "tagline",
        "data_lancamento",
        "duracao_min",
        "popularidade",
        "nota_media",
        "votos",
        "adulto",
        "video",
        "softcore",
        "idioma_original",
        "imdb_id",
        "homepage",
        "poster_path",
        "backdrop_path",
        "orcamento",
        "receita",
        "status",
        "paises_origem",
        "empresas",
        "paises_producao",
        "idiomas",
        "colecao_id",
        "trailer_url",
      ],
      catalogo.filmes.map(({ filme }) => [
        filme.id,
        filme.title,
        filme.original_title,
        filme.overview ?? "",
        filme.tagline,
        filme.release_date,
        filme.runtime,
        filme.popularity,
        filme.vote_average,
        filme.vote_count,
        filme.adult,
        filme.video,
        filme.softcore,
        filme.original_language,
        filme.imdb_id,
        filme.homepage,
        filme.poster_path,
        filme.backdrop_path,
        filme.budget,
        String(filme.revenue),
        filme.status,
        JSON.stringify(filme.origin_country),
        JSON.stringify(filme.production_companies),
        JSON.stringify(filme.production_countries),
        JSON.stringify(filme.spoken_languages),
        filme.belongs_to_collection?.id ?? null,
        filme.trailer_url ?? null,
      ]),
      [
        null, null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null, null,
        null, "jsonb", "jsonb", "jsonb", "jsonb", null, null,
      ],
    );
    const vinculos = [];
    const vinculosVistos = new Set();
    for (const { filme } of catalogo.filmes) {
      for (const genero of filme.genres ?? []) {
        const chave = `${filme.id}:${genero.id}`;
        if (vinculosVistos.has(chave)) continue;
        vinculosVistos.add(chave);
        vinculos.push([filme.id, genero.id]);
      }
    }
    await insertMany(client, "filme_generos", ["filme_id", "genero_id"], vinculos);
    await insertMany(
      client,
      "pessoas",
      ["id", "nome", "nome_original", "sexo", "departamento", "popularidade", "adulto", "foto_path"],
      catalogo.pessoas.map((pessoa) => [
        pessoa.id,
        pessoa.name,
        pessoa.original_name,
        pessoa.gender,
        pessoa.known_for_department,
        pessoa.popularity,
        pessoa.adult,
        pessoa.profile_path,
      ]),
    );
    await insertMany(
      client,
      "elenco",
      ["credit_id", "filme_id", "pessoa_id", "personagem", "ordem", "cast_id"],
      catalogo.creditos.map(({ filmeId, credito }) => [
        credito.credit_id,
        filmeId,
        credito.id,
        credito.character ?? "",
        credito.order,
        credito.cast_id,
      ]),
    );
    await insertMany(
      client,
      "lista_filmes",
      ["lista_slug", "filme_id", "posicao"],
      catalogo.posicoes.map((posicao) => [posicao.slug, posicao.filmeId, posicao.posicao]),
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (import.meta.url === entry) {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await semear(client, path.join(path.dirname(fileURLToPath(import.meta.url)), "../data/tmdb"));
  } finally {
    await client.end();
  }
}
