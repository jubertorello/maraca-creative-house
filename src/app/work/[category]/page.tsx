import { notFound } from "next/navigation";
import { ENABLED_CATEGORIES, getCategory, casesByCategory } from "@/lib/work";
import CategoryView from "./CategoryView";

export function generateStaticParams() {
  return ENABLED_CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({
  params,
}: PageProps<"/work/[category]">) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat || !cat.enabled) notFound();

  return <CategoryView category={cat} cases={casesByCategory(cat.slug)} />;
}
