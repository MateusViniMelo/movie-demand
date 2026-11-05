import Image from "next/image";
import Link from "next/link";
import { caminhoDoFilme } from "@/lib/filme.mjs";

export function Poster({
  filme,
  grande = false,
  aoEscolher,
}: {
  filme: { id: number; titulo: string; src: string };
  grande?: boolean;
  aoEscolher?: (id: number) => void;
}) {
  return (
    <Link
      href={caminhoDoFilme(filme.id)}
      onClick={() => aoEscolher?.(filme.id)}
      className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <figure>
        <div className="relative aspect-[2/3] overflow-hidden rounded-[4px] bg-stage-elev">
          <Image
            src={filme.src}
            alt={filme.titulo}
            fill
            sizes={grande ? "(max-width: 640px) 224px, 352px" : "(max-width: 640px) 124px, 176px"}
            className="object-cover"
          />
        </div>
      </figure>
    </Link>
  );
}
