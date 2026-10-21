import Image from "next/image";
import {
  capaDoFilme,
  formatarDuracao,
  rotuloGenero,
  type Filme,
} from "@/lib/filmes";

export function Hero({ filme }: { filme: Filme }) {
  return (
    <section className="relative min-h-[78vh]">
      <Image
        src={capaDoFilme(filme.id)}
        alt=""
        fill
        preload
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-stage to-transparent" />
      <div className="relative z-10 flex min-h-[78vh] max-w-xl flex-col justify-end px-4 pt-28 pb-28 sm:px-12">
        <p className="text-sm font-medium tracking-wide text-white/80">
          {rotuloGenero(filme.genero)}
        </p>
        <h1 className="mt-2 font-display text-5xl leading-[0.95] tracking-tight text-white sm:text-7xl">
          {filme.titulo}
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-white/90">
          {filme.descricao}
        </p>
        <p className="mt-4 font-mono text-sm text-white/75">
          {formatarDuracao(filme.duracao_min)}
          {filme.tags.length > 0 ? ` · ${filme.tags.join(" · ")}` : ""}
        </p>
      </div>
    </section>
  );
}
