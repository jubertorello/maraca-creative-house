import { NextRequest, NextResponse } from "next/server";
import { readCases, deleteCase } from "@/lib/admin-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ category: string; slug: string }> },
) {
  const { category, slug } = await params;
  const cases = await readCases();
  const found = cases.find((c) => c.category === category && c.slug === slug);
  if (!found) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }
  return NextResponse.json(found);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ category: string; slug: string }> },
) {
  const { category, slug } = await params;
  await deleteCase(category, slug);
  return NextResponse.json({ ok: true });
}
