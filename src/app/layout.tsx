import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n";
import { SITE_URL, SITE_NAME, DESCRIPTION, KEYWORDS } from "@/lib/site";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Agencia Creativa en Madrid`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  authors: [{ name: "MARACA" }],
  creator: "MARACA",
  robots: { index: true, follow: true },
  // Deliberately no `alternates.canonical` here — Next.js metadata doesn't
  // relativize an inherited canonical per route, so a blanket one here
  // would make every page claim "/" as canonical. Each page/route sets its
  // own instead (home included, see page.tsx).
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Agencia Creativa en Madrid`,
    description: DESCRIPTION,
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Agencia Creativa en Madrid`,
    description: DESCRIPTION,
    images: ["/brand/og-image.png"],
  },
};

// Organization structured data (JSON-LD) — helps Google show a knowledge
// panel / rich result for brand-name searches ("MARACA agencia creativa").
const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MARACA",
  alternateName: "MARACA Creative House",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/maraca-lockup.png`,
  description: DESCRIPTION,
  email: "hello@lamaraca.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Madrid",
    addressCountry: "ES",
  },
  sameAs: [] as string[],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${georgiaPro.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
      </head>
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
