import Image from "next/image";

export function Poster({
  filme,
  grande = false,
}: {
  filme: { titulo: string; src: string };
  grande?: boolean;
}) {
  return (
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
  );
}
