import type { Metadata } from "next";
import { Nunito, Space_Grotesk } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

const space = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "FluentUp — English Flashcards",
  description:
    "Aprende inglés a tu ritmo: guarda palabras y frases, repasa y mide tu progreso.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "FluentUp — Tu inglés, a tu ritmo",
    description: "Guarda palabras, practica y convierte cada día en progreso.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FluentUp — Tu inglés, a tu ritmo",
    description: "Aprende · Practica · Avanza",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${nunito.variable} ${space.variable}`}>{children}</body>
    </html>
  );
}
