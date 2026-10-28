import Image from "next/image";
import {
  formatarDuracao,
  posterDoFilme,
  rotuloGenero,
  type Filme,
} from "@/lib/filmes";

export function Poster({ filme }: { filme: Filme }) {
  return (
    <figure className="group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-[4px] bg-stage-elev">
        <Image
          src={posterDoFilme(filme.id)}
          alt=""
          fill
          sizes="(max-width: 640px) 124px, 176px"
          className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
        />
      </div>
      <figcaption className="pt-2">
        <h3 className="font-display text-lg leading-none tracking-tight">
          {filme.titulo}
        </h3>
        <p className="mt-1 font-mono text-[0.7rem] text-stage-muted">
          {rotuloGenero(filme.genero)} · {formatarDuracao(filme.duracao_min)}
        </p>
      </figcaption>
    </figure>
  );
}
