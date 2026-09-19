import { NextRequest, NextResponse } from "next/server";
import { configuredCloudinary, CLOUDINARY_ENABLED } from "@/lib/cloudinary";
import { getMediaUsage } from "@/lib/media-usage";

export const runtime = "nodejs";

/**
 * Deletes one Cloudinary asset — only if it's genuinely unused. The admin
 * gallery (/admin/media) already disables the button for in-use files, but
 * that's a UI convenience, not the real guard: this route re-checks usage
 * itself against live data before touching anything, so a stale page or a
 * direct API call can't delete something the site still references.
 *
 * `publicId` arrives URL-encoded (it contains slashes, e.g.
 * "maraca/brand/clients/caixabank") — the dynamic segment is the whole
 * encoded string, decoded here.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) {
  if (!CLOUDINARY_ENABLED) {
    return NextResponse.json({ error: "Cloudinary no está conectado." }, { status: 501 });
  }

  const { publicId: encoded } = await params;
  const publicId = decodeURIComponent(encoded);
  const resourceType = req.nextUrl.searchParams.get("resourceType") === "video" ? "video" : "image";
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Falta url." }, { status: 400 });
  }

  const usage = await getMediaUsage(url);
  if (usage.length > 0) {
    return NextResponse.json(
      { error: "Este archivo está en uso, no se puede eliminar.", usage },
      { status: 409 },
    );
  }

  try {
    const result = await configuredCloudinary().uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    if (result.result !== "ok" && result.result !== "not found") {
      return NextResponse.json({ error: "No se pudo eliminar." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar." }, { status: 500 });
  }
}
