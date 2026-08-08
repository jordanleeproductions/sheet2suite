import type { Metadata } from "next";
import { Playfair_Display, Roboto_Mono, JetBrains_Mono, Geist_Mono, Inter, Cormorant_Garamond, Nunito, Bodoni_Moda, Montserrat } from "next/font/google";
import { Sheet2ThemeProvider } from "@/lib/core/theme/ThemeProvider";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif-google",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono-google",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-google",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono-google",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans-google",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant-google",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito-google",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni-google",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat-google",
});

export const metadata: Metadata = {
  title: "Sheet2Vow - Digital Wedding Planner",
  description: "A sleek, mobile-first dashboard mapping your Google Sheet to a high-end Calm UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${robotoMono.variable} ${jetbrainsMono.variable} ${geistMono.variable} ${cormorant.variable} ${nunito.variable} ${bodoni.variable} ${montserrat.variable}`}
    >
      <body>
        <Sheet2ThemeProvider>
          {children}
        </Sheet2ThemeProvider>
      </body>
    </html>
  );
}
