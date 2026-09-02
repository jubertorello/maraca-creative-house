import { notFound } from "next/navigation";
import { CASES, getCase } from "@/lib/work";
import CaseStudyView from "./CaseStudyView";

export function generateStaticParams() {
  return CASES.map((c) => ({ category: c.category, slug: c.slug }));
}

export default async function CaseStudyPage({
  params,
}: PageProps<"/work/[category]/[slug]">) {
  const { category, slug } = await params;
  const study = getCase(category, slug);
  if (!study) notFound();

  return <CaseStudyView study={study} />;
}
