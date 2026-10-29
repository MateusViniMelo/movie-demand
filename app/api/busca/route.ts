import { buscarFilmes } from "@/lib/busca-db";
import { cabecalhoDaApi } from "@/lib/seo.mjs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const pagina = Number(url.searchParams.get("pagina"));
  const tamanho = Number(url.searchParams.get("tamanho"));
  try {
    const resultado = await buscarFilmes({ texto: q, pagina, tamanho });
    return Response.json(resultado, { headers: cabecalhoDaApi() });
  } catch {
    return Response.json({ estado: "erro" }, { status: 500, headers: cabecalhoDaApi() });
  }
}

