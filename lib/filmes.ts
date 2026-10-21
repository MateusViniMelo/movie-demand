export type OrigemFilme = "real" | "sintetica";

export type Filme = {
  id: number;
  titulo: string;
  descricao: string;
  genero: string;
  duracao_min: number;
  url_midia: string;
  origem: OrigemFilme;
  tags: string[];
};

const ROTULOS_GENERO: Record<string, string> = {
  drama: "Drama",
  ficcao: "Ficção",
  animacao: "Animação",
};

/** Recorte da seção 7 do experimento. `url_midia` fica no dado e fora da tela. */
export const filmes: Filme[] = [
  {
    id: 1,
    titulo: "Central do Brasil",
    descricao:
      "Uma ex-professora que escreve cartas numa estação acompanha um menino pelo interior em busca do pai.",
    genero: "drama",
    duracao_min: 113,
    url_midia: "demo://filme/1",
    origem: "real",
    tags: ["brasil", "estrada", "familia"],
  },
  {
    id: 2,
    titulo: "Nomadland",
    descricao:
      "Uma viúva passa a viver numa van e cruza o país em empregos temporários, dormindo em estacionamentos.",
    genero: "drama",
    duracao_min: 108,
    url_midia: "demo://filme/2",
    origem: "real",
    tags: ["estrada", "trabalho"],
  },
  {
    id: 3,
    titulo: "Moonlight",
    descricao:
      "A vida de um garoto da periferia é acompanhada em três idades, entre o silêncio e a descoberta de quem ele é.",
    genero: "drama",
    duracao_min: 111,
    url_midia: "demo://filme/3",
    origem: "real",
    tags: ["identidade", "infancia"],
  },
  {
    id: 4,
    titulo: "Lady Bird",
    descricao:
      "No último ano escolar, uma jovem briga com a mãe enquanto tenta sair da cidade onde cresceu.",
    genero: "drama",
    duracao_min: 94,
    url_midia: "demo://filme/4",
    origem: "real",
    tags: ["familia", "escola"],
  },
  {
    id: 5,
    titulo: "Manchester à Beira-Mar",
    descricao:
      "Um zelador volta à cidade natal para cuidar do sobrinho depois da morte do irmão.",
    genero: "drama",
    duracao_min: 137,
    url_midia: "demo://filme/5",
    origem: "real",
    tags: ["luto", "familia"],
  },
  {
    id: 6,
    titulo: "Whiplash",
    descricao:
      "Um percussionista entra na banda de um conservatório e passa a ser humilhado pelo regente nos ensaios.",
    genero: "drama",
    duracao_min: 107,
    url_midia: "demo://filme/6",
    origem: "real",
    tags: ["musica", "professor"],
  },
  {
    id: 7,
    titulo: "Gravidade",
    descricao:
      "Depois que destroços atingem o ônibus espacial, uma astronauta tenta alcançar outra estação com o oxigênio acabando.",
    genero: "ficcao",
    duracao_min: 91,
    url_midia: "demo://filme/7",
    origem: "real",
    tags: ["espaco", "sobrevivencia"],
  },
  {
    id: 8,
    titulo: "Interestelar",
    descricao:
      "Um ex-piloto cruza um buraco de minhoca em busca de outro planeta. Perto de um buraco negro, as horas dele e as da filha deixam de coincidir.",
    genero: "ficcao",
    duracao_min: 169,
    url_midia: "demo://filme/8",
    origem: "real",
    tags: ["espaco", "tempo", "familia"],
  },
  {
    id: 9,
    titulo: "Toy Story",
    descricao:
      "Os brinquedos de um quarto se movem quando o menino sai. O caubói acha que será trocado pelo patrulheiro recém-chegado.",
    genero: "animacao",
    duracao_min: 81,
    url_midia: "demo://filme/9",
    origem: "real",
    tags: ["infantil", "brinquedo"],
  },
  {
    id: 10,
    titulo: "Divertida Mente",
    descricao:
      "Dentro da cabeça de uma garota, cinco emoções disputam o comando enquanto a família muda de cidade.",
    genero: "animacao",
    duracao_min: 95,
    url_midia: "demo://filme/10",
    origem: "real",
    tags: ["infantil", "emocoes"],
  },
];

export function rotuloGenero(genero: string): string {
  return ROTULOS_GENERO[genero] ?? genero;
}

export function formatarDuracao(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${horas}:${resto.toString().padStart(2, "0")}`;
}

export function formatarNumero(id: number): string {
  return `Nº\u00a0${id.toString().padStart(3, "0")}`;
}

export function rotuloFichas(quantidade: number): string {
  return quantidade === 1 ? "1 ficha" : `${quantidade} fichas`;
}

const POSTERS: Record<number, string> = {
  1: "/posters/central.jpg",
  2: "/posters/nomadland.jpg",
  3: "/posters/moonlight.jpg",
  4: "/posters/ladybird.jpg",
  5: "/posters/manchester.jpg",
  6: "/posters/whiplash.jpg",
  7: "/posters/gravidade.jpg",
  8: "/posters/interestelar.jpg",
  9: "/posters/toystory.jpg",
  10: "/posters/divertida.jpg",
};

const CAPAS: Record<number, string> = {
  1: "/capas/central.jpg",
};

export function posterDoFilme(id: number): string {
  return POSTERS[id] ?? POSTERS[1];
}

export function capaDoFilme(id: number): string {
  return CAPAS[id] ?? posterDoFilme(id);
}

export function filmesDoGenero(genero: string): Filme[] {
  return filmes.filter((filme) => filme.genero === genero);
}
