import { NextRequest, NextResponse } from "next/server";
import { readClients, upsertClient, reorderClients } from "@/lib/admin-data";
import type { Client } from "@/lib/clients";

export async function GET() {
  return NextResponse.json(await readClients());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Client;
  if (!body.slug || !body.name) {
    return NextResponse.json({ error: "Falta name o slug." }, { status: 400 });
  }
  await upsertClient(body);
  return NextResponse.json({ ok: true });
}

/** Reorder: { slugs: [...] } in the new order. */
export async function PATCH(req: NextRequest) {
  const { slugs } = (await req.json()) as { slugs: string[] };
  if (!Array.isArray(slugs)) {
    return NextResponse.json({ error: "Falta slugs." }, { status: 400 });
  }
  await reorderClients(slugs);
  return NextResponse.json({ ok: true });
}
