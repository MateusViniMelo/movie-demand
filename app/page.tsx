import { Suspense } from "react";
import { Fileira } from "@/components/fileira";
import { Topo } from "@/components/topo";
import { carregarVitrine } from "@/lib/vitrine";

export default function Catalogo() {
  return (
    <main className="min-h-dvh bg-stage text-stage-ink">
      <Topo />
      <Suspense fallback={<p className="px-4 pt-28 text-base sm:px-12">Carregando o catálogo.</p>}>
        <Vitrine />
      </Suspense>
    </main>
  );
}

async function Vitrine() {
  const { destaque, fileiras } = await carregarVitrine();
  if (destaque.length === 0 && fileiras.every((fileira) => fileira.filmes.length === 0)) {
    return <p className="px-4 pt-28 text-base sm:px-12">Nenhuma ficha neste catálogo.</p>;
  }

  return (
    <div className="space-y-8 pt-24 pb-16">
      {destaque.length > 0 ? <Fileira titulo="Novidades" filmes={destaque} primeiroMaior /> : null}
      {fileiras.map((fileira) => (
        <Fileira key={fileira.titulo} titulo={fileira.titulo} filmes={fileira.filmes} />
      ))}
    </div>
  );
}
