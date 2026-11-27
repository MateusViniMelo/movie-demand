import { FILEIRAS, montarVitrine } from "./cartaz.mjs";
import { executarBuscaPorGenero } from "./busca.mjs";

/**
 * Carregadores PostgreSQL para a CLI de coleta (sem Prisma nem `app/`).
 *
 * @param {import("pg").Client} client
 */
export function criarCarregadoresColeta(client) {
  const consultar = (sql, params) =>
    client.query(sql, params).then((resultado) => resultado.rows);

  return {
    async carregarFilme(id) {
      const [filme] = await consultar(
        `SELECT id, titulo, sinopse, poster_path, backdrop_path, duracao_min,
                nota_media, votos, trailer_url
         FROM filmes WHERE id = $1`,
        [id],
      );
      if (!filme) return null;

      const generos = await consultar(
        `SELECT g.id, g.nome
         FROM filme_generos fg
         JOIN generos g ON g.id = fg.genero_id
         WHERE fg.filme_id = $1
         ORDER BY g.id`,
        [id],
      );

      const elencos = await consultar(
        `SELECT e.personagem, e.ordem, e.pessoa_id, p.nome, p.foto_path
         FROM elenco e
         JOIN pessoas p ON p.id = e.pessoa_id
         WHERE e.filme_id = $1
         ORDER BY e.ordem ASC, e.pessoa_id ASC`,
        [id],
      );

      return { ...filme, generos, elencos };
    },

    carregarFilmesPorGenero(entrada) {
      return executarBuscaPorGenero(consultar, entrada);
    },

    async carregarVitrine() {
      const slugs = FILEIRAS.map((fileira) => fileira.slug);
      const linhas = await consultar(
        `SELECT lf.lista_slug AS slug, lf.posicao,
                f.id, f.titulo, f.sinopse, f.duracao_min AS "duracaoMin",
                f.poster_path AS "posterPath", f.backdrop_path AS "backdropPath"
         FROM lista_filmes lf
         JOIN filmes f ON f.id = lf.filme_id
         WHERE lf.lista_slug = ANY($1::text[])
         ORDER BY lf.lista_slug, lf.posicao ASC`,
        [slugs],
      );

      const generosPorFilme = await consultar(
        `SELECT fg.filme_id, g.nome
         FROM filme_generos fg
         JOIN generos g ON g.id = fg.genero_id
         WHERE fg.filme_id = ANY(
           SELECT DISTINCT filme_id FROM lista_filmes
         )
         ORDER BY fg.filme_id, g.id`,
      );

      const mapaGeneros = new Map();
      for (const linha of generosPorFilme) {
        const lista = mapaGeneros.get(linha.filme_id) ?? [];
        lista.push(linha.nome);
        mapaGeneros.set(linha.filme_id, lista);
      }

      return montarVitrine(
        linhas.map((linha) => ({
          ...linha,
          generos: mapaGeneros.get(linha.id) ?? [],
        })),
      );
    },
  };
}

/**
 * Esvazia chaves do experimento no Redis local antes de B-cold.
 *
 * @param {import("redis").RedisClientType | { isOpen: boolean; connect: () => Promise<void>; flushDb: () => Promise<unknown> }} cliente
 */
export async function flushRedisExperimento(cliente) {
  if (!cliente.isOpen) {
    await cliente.connect();
  }
  await cliente.flushDb();
}