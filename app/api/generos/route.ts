import { NextResponse } from "next/server";
import { listarGeneros } from "@/lib/busca-db";
import { cabecalhoDaApi } from "@/lib/seo.mjs";

export async function GET() {
  try {
    const generos = await listarGeneros();
    return NextResponse.json({ generos }, { headers: cabecalhoDaApi() });
  } catch {
    return NextResponse.json(
      { generos: [], estado: "erro" },
      { status: 500, headers: cabecalhoDaApi() },
    );
  }
}
