#!/usr/bin/env node
import "dotenv/config";
import process from "node:process";
import pg from "pg";
import { createClient } from "redis";
import { criarArmazenamentoRedis } from "../lib/armazenamento-redis.mjs";
import {
  formatarTabelaSecao10,
  parseArgumentosColeta,
  PROTOCOLO_COLETA_PADRAO,
  resolverAmostraColeta,
  selecionarLinhasSecao10,
} from "../lib/coleta-experimento.mjs";
import {
  criarCarregadoresColeta,
  flushRedisExperimento,
} from "../lib/loaders-coleta.mjs";
import { executarSerieExperimento } from "../lib/serie-experimento.mjs";

async function main() {
  const opcoes = parseArgumentosColeta(process.argv);

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL é obrigatória");
  }
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL é obrigatória");
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on("error", () => {});

  try {
    const amostra = await resolverAmostraColeta(client, opcoes.amostra);
    const { carregarFilme, carregarFilmesPorGenero, carregarVitrine } =
      criarCarregadoresColeta(client);
    const armazenamento = criarArmazenamentoRedis(redisClient);

    const resultado = await executarSerieExperimento({
      n: opcoes.n,
      warmUp: opcoes.warmUp,
      concorrencia: opcoes.concorrencia,
      amostra,
      armazenamento,
      flush: async () => {
        await flushRedisExperimento(redisClient);
      },
      carregarFilme,
      carregarFilmesPorGenero,
      carregarVitrine,
    });

    const protocolo = `# Protocolo: N=${opcoes.n}, warm-up=${opcoes.warmUp}, concorrência=${opcoes.concorrencia} (padrão local ${PROTOCOLO_COLETA_PADRAO.n}/${PROTOCOLO_COLETA_PADRAO.warmUp}/${PROTOCOLO_COLETA_PADRAO.concorrencia})`;
    const amostraTxt = `# Amostra: filme=${amostra.filmeId}, gênero=${amostra.generoId}, página=${amostra.pagina}, tamanho=${amostra.tamanho}`;

    console.log(protocolo);
    console.log(amostraTxt);
    console.log("");
    console.log(
      formatarTabelaSecao10(selecionarLinhasSecao10(resultado, opcoes.concorrencia)),
    );
  } finally {
    await client.end();
    if (redisClient.isOpen) {
      await redisClient.disconnect();
    }
  }
}

main().catch((erro) => {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exitCode = 1;
});