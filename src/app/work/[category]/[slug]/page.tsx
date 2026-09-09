import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CASES, getCaseLive, getCategoryLive } from "@/lib/work";
import CaseStudyView from "./CaseStudyView";

// Revalidate periodically so edits made in /admin (once Supabase is
// connected) show up on the live site without a full redeploy.
export const revalidate = 60;

export function generateStaticParams() {
  return CASES.map((c) => ({ category: c.category, slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[category]/[slug]">): Promise<Metadata> {
  const { category, slug } = await params;
  const study = await getCaseLive(category, slug);
  if (!study) return {};

  const cat = await getCategoryLive(study.category);
  const categoryName = cat?.name.es;
  const sameName = study.title.toLowerCase() === study.client.toLowerCase();
  const lead = study.blocks.find((b) => b.type === "text" && b.variant === "lead");
  const description =
    study.seoDescription ||
    (lead && lead.type === "text"
      ? lead.content.es
      : `${study.title}${sameName ? "" : ` — ${study.client}`}, un proyecto de ${categoryName ?? "MARACA"}.`);

  const title = study.seoTitle || (sameName ? study.title : `${study.title} — ${study.client}`);
  const firstImage = study.blocks.find(
    (b) => b.type === "image" && b.src,
  ) as { src?: string } | undefined;

  return {
    title,
    description,
    alternates: { canonical: `/work/${study.category}/${study.slug}` },
    openGraph: {
      title: `${title} | MARACA`,
      description,
      ...(firstImage?.src ? { images: [{ url: firstImage.src }] } : {}),
    },
  };
}

export default async function CaseStudyPage({
  params,
}: PageProps<"/work/[category]/[slug]">) {
  const { category, slug } = await params;
  const study = await getCaseLive(category, slug);
  if (!study) notFound();

  return <CaseStudyView study={study} />;
}
