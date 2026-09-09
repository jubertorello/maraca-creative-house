import { readCases } from "@/lib/admin-data";
import CaseForm from "../CaseForm";

export default async function NewCasePage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cases = await readCases();
  const count = cases.filter((c) => c.category === category).length;
  const nextIndex = String(count + 1).padStart(2, "0");

  return (
    <div>
      <h1 className="mb-8 text-2xl font-medium">Nuevo caso</h1>
      <CaseForm categorySlug={category} nextIndex={nextIndex} />
    </div>
  );
}
