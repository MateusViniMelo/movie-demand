import { carregarRecomendacoes } from "@/lib/recomendacoes-db";
import { cabecalhoDaApi } from "@/lib/seo.mjs";

export async function GET(request: Request) {
  const filme = new URL(request.url).searchParams.get("filme") ?? "";
  const resultado = await carregarRecomendacoes(filme);
  return Response.json(resultado.corpo, {
    status: resultado.status,
    headers: cabecalhoDaApi(),
  });
}
