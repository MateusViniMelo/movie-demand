import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-barlow-condensed",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-source-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cineverso",
  description: "Fichas de demonstração do catálogo de filmes sob demanda.",
};

export const viewport: Viewport = {
  themeColor: "#141414",
};

const scriptTema = `(function(){try{var escuro=localStorage.getItem("tema")!=="claro";document.documentElement.classList.toggle("dark",escuro);var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute("content",escuro?"#141414":"#f3f3f3")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${barlowCondensed.variable} ${sourceSans.variable} ${ibmPlexMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://image.tmdb.org" />
      </head>
      <body
        className="min-h-full flex flex-col bg-stage text-stage-ink"
        suppressHydrationWarning
      >
        <a
          href="#conteudo"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-[max(0.75rem,env(safe-area-inset-top))] focus-visible:left-[max(1rem,env(safe-area-inset-left))] focus-visible:z-50 focus-visible:inline-flex focus-visible:h-11 focus-visible:cursor-pointer focus-visible:touch-manipulation focus-visible:items-center focus-visible:rounded-full focus-visible:bg-stage-elev focus-visible:px-4 focus-visible:text-sm focus-visible:font-medium focus-visible:text-stage-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Ir para o conteúdo
        </a>
        <Script id="tema" strategy="beforeInteractive">
          {scriptTema}
        </Script>
        {children}
      </body>
    </html>
  );
}
