import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { getSeoContentLive, getFooterContentLive } from "@/lib/site-content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MainArea from "@/components/MainArea";

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

// Global SEO (title suffix, description, keywords, share image) is editable
// from /admin/seo — see src/lib/site-content.ts (SeoContent) for the shape.
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoContentLive();
  const { global } = seo;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: global.defaultTitle,
      template: `%s | ${global.titleSuffix}`,
    },
    description: global.description,
    keywords: global.keywords,
    authors: [{ name: "MARACA" }],
    creator: "MARACA",
    robots: { index: true, follow: true },
    // Deliberately no `alternates.canonical` here — Next.js metadata doesn't
    // relativize an inherited canonical per route, so a blanket one here
    // would make every page claim "/" as canonical. Each page/route sets
    // its own instead (home included, see page.tsx).
    openGraph: {
      type: "website",
      locale: "es_ES",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: global.defaultTitle,
      description: global.description,
      images: [{ url: global.ogImageUrl, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: global.defaultTitle,
      description: global.description,
      images: [global.ogImageUrl],
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [seo, footer] = await Promise.all([getSeoContentLive(), getFooterContentLive()]);

  // Organization structured data (JSON-LD) — helps Google show a knowledge
  // panel / rich result for brand-name searches ("MARACA agencia creativa").
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MARACA",
    alternateName: "MARACA Creative House",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/maraca-lockup.png`,
    description: seo.global.description,
    email: footer.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Madrid",
      addressCountry: "ES",
    },
    sameAs: [] as string[],
  };

  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${georgiaPro.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          // JSON.stringify doesn't escape "<" — the HTML parser closes the
          // <script> tag on a literal "</script>" no matter what type it
          // is, so a "<" inside admin-editable SEO text (orgJsonLd.description
          // comes from /admin/seo) could otherwise break out of this tag.
          // < is the same character to JSON, invisible to it either way.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <LocaleProvider>
          <Navbar />
          <MainArea>{children}</MainArea>
          <Footer content={footer} />
        </LocaleProvider>
      </body>
    </html>
  );
}
