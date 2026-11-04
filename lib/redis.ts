import { createClient } from "redis";

function criarCliente() {
  return createClient({ url: process.env.REDIS_URL });
}

type ClienteRedis = ReturnType<typeof criarCliente>;

const globalForRedis = globalThis as unknown as { redis?: ClienteRedis };

export const redis = globalForRedis.redis ?? criarCliente();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
