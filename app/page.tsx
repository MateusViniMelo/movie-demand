import { Fileira } from "@/components/fileira";
import { Hero } from "@/components/hero";
import { Topo } from "@/components/topo";
import { filmes, filmesDoGenero } from "@/lib/filmes";

const FILEIRAS = [
  { titulo: "Drama", genero: "drama" },
  { titulo: "Ficção", genero: "ficcao" },
  { titulo: "Animação", genero: "animacao" },
] as const;

export default function Catalogo() {
  const destaque = filmes[0];

  return (
    <main className="min-h-dvh bg-stage text-stage-ink">
      <Topo />
      {destaque ? (
        <>
          <Hero filme={destaque} />
          <div className="relative z-10 -mt-10 space-y-8 pb-16">
            {FILEIRAS.map((fileira) => (
              <Fileira
                key={fileira.genero}
                titulo={fileira.titulo}
                filmes={filmesDoGenero(fileira.genero)}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="px-4 pt-28 text-base sm:px-12">Nenhuma ficha neste catálogo.</p>
      )}
    </main>
  );
}
