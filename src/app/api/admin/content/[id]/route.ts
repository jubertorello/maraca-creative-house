import { NextRequest, NextResponse } from "next/server";
import { readSiteContent, writeSiteContent } from "@/lib/admin-data";

const IDS = [
  "home",
  "about",
  "team",
  "seo",
  "privacyPolicy",
  "contact",
  "footer",
  "strategy",
] as const;
type ContentId = (typeof IDS)[number];

function asId(id: string): ContentId {
  if (!(IDS as readonly string[]).includes(id)) throw new Error("Unknown content id");
  return id as ContentId;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    return NextResponse.json(await readSiteContent(asId(id)));
  } catch {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await req.json();
  try {
    await writeSiteContent(asId(id), data);
  } catch {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
