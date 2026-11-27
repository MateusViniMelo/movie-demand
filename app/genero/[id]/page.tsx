import { redirect } from "next/navigation";
import { caminhoDaBuscaPorGenero, idsDeGenero } from "@/lib/busca.mjs";
import { textoDe } from "@/lib/consulta.mjs";

export default async function PaginaGeneroPorId(props: PageProps<"/genero/[id]">) {
  const { id } = await props.params;
  const consulta = await props.searchParams;
  const ids = idsDeGenero({ generoId: id });
  const pagina = Number(textoDe(consulta.pagina) || "1");
  redirect(caminhoDaBuscaPorGenero(ids, Number.isInteger(pagina) && pagina > 0 ? pagina : 1));
}
