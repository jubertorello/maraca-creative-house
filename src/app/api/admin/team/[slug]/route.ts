import { NextRequest, NextResponse } from "next/server";
import { deleteMember } from "@/lib/admin-data";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  await deleteMember(slug);
  return NextResponse.json({ ok: true });
}
