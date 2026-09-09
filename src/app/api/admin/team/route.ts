import { NextRequest, NextResponse } from "next/server";
import { readTeam, upsertMember, reorderTeam } from "@/lib/admin-data";
import type { Member } from "@/lib/team";

export async function GET() {
  return NextResponse.json(await readTeam());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Member;
  if (!body.slug || !body.name) {
    return NextResponse.json({ error: "Falta name o slug." }, { status: 400 });
  }
  await upsertMember(body);
  return NextResponse.json({ ok: true });
}

/** Reorder: { slugs: [...] } in the new order. */
export async function PATCH(req: NextRequest) {
  const { slugs } = (await req.json()) as { slugs: string[] };
  if (!Array.isArray(slugs)) {
    return NextResponse.json({ error: "Falta slugs." }, { status: 400 });
  }
  await reorderTeam(slugs);
  return NextResponse.json({ ok: true });
}
