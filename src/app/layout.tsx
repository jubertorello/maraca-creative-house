import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n";
import { SITE_URL, SITE_NAME, COMPANY } from "@/lib/site";
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

  // Structured data (JSON-LD): the agency as an Organization/ProfessionalService
  // (name, address, phone, social profiles → what feeds the knowledge panel and
  // local results for "agencia creativa Madrid") plus the WebSite it publishes.
  // Social profiles come from the footer content (editable in /admin/footer);
  // bare placeholders like "https://instagram.com" are left out.
  const sameAs = footer.socials
    .map((s) => s.href)
    .filter((href) => !/^https?:\/\/(www\.)?[a-z]+\.com\/?$/i.test(href));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": `${SITE_URL}/#organization`,
        name: "MARACA",
        legalName: COMPANY.legalName,
        alternateName: "MARACA Creative House",
        taxID: COMPANY.taxId,
        url: SITE_URL,
        logo: `${SITE_URL}/brand/maraca-lockup.png`,
        image: `${SITE_URL}${seo.global.ogImageUrl}`,
        description: seo.global.description,
        email: footer.email,
        telephone: COMPANY.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: COMPANY.street,
          postalCode: COMPANY.postalCode,
          addressLocality: COMPANY.city,
          addressRegion: COMPANY.region,
          addressCountry: COMPANY.country,
        },
        areaServed: [{ "@type": "Country", name: "España" }],
        knowsAbout: seo.global.keywords,
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: ["es", "en"],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
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
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
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
