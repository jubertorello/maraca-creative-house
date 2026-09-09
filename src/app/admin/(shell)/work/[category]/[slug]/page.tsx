import { notFound } from "next/navigation";
import { readCases } from "@/lib/admin-data";
import CaseForm from "../CaseForm";

export default async function EditCasePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const cases = await readCases();
  const found = cases.find((c) => c.category === category && c.slug === slug);
  if (!found) notFound();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-medium">{found.title}</h1>
      <CaseForm categorySlug={category} initial={found} nextIndex={found.index} />
    </div>
  );
}
