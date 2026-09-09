import { NextRequest, NextResponse } from "next/server";
import { readCategories, updateCategory } from "@/lib/admin-data";
import type { Category } from "@/lib/work";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const categories = await readCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    return NextResponse.json({ error: "No encontrada." }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const patch = (await req.json()) as Partial<Category>;
  const updated = await updateCategory(slug, patch);
  if (!updated) {
    return NextResponse.json({ error: "No encontrada." }, { status: 404 });
  }
  return NextResponse.json(updated);
}
