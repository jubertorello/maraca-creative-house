import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ENABLED_CATEGORIES, getCategory, casesByCategory } from "@/lib/work";
import CategoryView from "./CategoryView";
import StrategyView from "./StrategyView";
import PendingView from "./PendingView";

export function generateStaticParams() {
  return ENABLED_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat || !cat.enabled) return {};

  // Pending categories have no real content yet — keep them out of search
  // results until they do (see also sitemap.ts, which already omits them).
  if (cat.kind === "pending") {
    return { title: cat.name.es, robots: { index: false, follow: true } };
  }

  const clients = cat.clients.slice(0, 6).join(", ");
  const description = clients
    ? `${cat.name.es} en MARACA, agencia creativa de Madrid — con marcas como ${clients}.`
    : `${cat.name.es} en MARACA, agencia creativa de Madrid.`;
  return {
    title: cat.name.es,
    description,
    alternates: { canonical: `/work/${cat.slug}` },
    openGraph: { title: `${cat.name.es} | MARACA`, description },
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/work/[category]">) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat || !cat.enabled) notFound();

  if (cat.kind === "manifesto") {
    return <StrategyView category={cat} />;
  }

  if (cat.kind === "pending") {
    return <PendingView category={cat} />;
  }

  return <CategoryView category={cat} cases={casesByCategory(cat.slug)} />;
}
