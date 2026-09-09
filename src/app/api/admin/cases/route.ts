import { NextRequest, NextResponse } from "next/server";
import { readCases, upsertCase, reorderCases } from "@/lib/admin-data";
import type { CaseStudy } from "@/lib/work";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const cases = await readCases();
  return NextResponse.json(
    category ? cases.filter((c) => c.category === category) : cases,
  );
}

/** Create or fully replace one case. */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as CaseStudy;
  if (!body.category || !body.slug) {
    return NextResponse.json(
      { error: "Falta category o slug." },
      { status: 400 },
    );
  }
  await upsertCase(body);
  return NextResponse.json({ ok: true });
}

/** Reorder cases within a category: { category, slugs: [...] } in the new order. */
export async function PATCH(req: NextRequest) {
  const { category, slugs } = (await req.json()) as {
    category: string;
    slugs: string[];
  };
  if (!category || !Array.isArray(slugs)) {
    return NextResponse.json(
      { error: "Falta category o slugs." },
      { status: 400 },
    );
  }
  await reorderCases(category, slugs);
  return NextResponse.json({ ok: true });
}
