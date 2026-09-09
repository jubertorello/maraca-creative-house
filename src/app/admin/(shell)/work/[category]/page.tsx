import { notFound } from "next/navigation";
import { readCategories, readCases } from "@/lib/admin-data";
import CategoryManager from "./CategoryManager";

export default async function AdminCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const [categories, cases] = await Promise.all([readCategories(), readCases()]);
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const catCases = cases
    .filter((c) => c.category === category)
    .sort((a, b) => a.index.localeCompare(b.index));

  return <CategoryManager category={cat} cases={catCases} />;
}
