import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

// Serif display face — the real Georgia Pro (Figma). Light 300 + Regular 400
// + SemiBold 600, with matching italics.
const georgiaPro = localFont({
  variable: "--font-georgia-pro",
  display: "swap",
  src: [
    { path: "./fonts/GeorgiaPro-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/GeorgiaPro-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "./fonts/GeorgiaPro-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/GeorgiaPro-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/GeorgiaPro-SemiBold.ttf", weight: "600", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "MARACA — Creative House",
  description:
    "MARACA es una creative house: branding, estrategia de comunicación, creación de contenido, diseño web, campañas de publicidad y eventos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${georgiaPro.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LocaleProvider>
          <Navbar />
          <main className="flex flex-1 flex-col pt-20 md:pt-[120px]">
            {children}
          </main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
