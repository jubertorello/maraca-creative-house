import { NextRequest, NextResponse } from "next/server";
import { configuredCloudinary, CLOUDINARY_ENABLED } from "@/lib/cloudinary";

export const runtime = "nodejs";

/** Lists what's already been uploaded to Cloudinary — everything in the
 * account, not just under the "maraca" folder our own upload widget uses —
 * so the admin's media picker can offer "choose an existing file" instead
 * of only "upload a new one" (see MediaLibraryPicker.tsx) even for files
 * someone uploaded straight from Cloudinary's own console into some other
 * folder. Safe to list the whole account unscoped: this Cloudinary account
 * is dedicated to this one site. */
export async function GET(req: NextRequest) {
  if (!CLOUDINARY_ENABLED) {
    return NextResponse.json({ error: "Cloudinary no está conectado." }, { status: 501 });
  }

  const resourceType = req.nextUrl.searchParams.get("type") === "video" ? "video" : "image";

  try {
    const cloudinary = configuredCloudinary();
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: resourceType,
      max_results: 200,
      context: false,
    });
    const items = (result.resources as Array<Record<string, unknown>>).map((r) => ({
      url: r.secure_url as string,
      publicId: r.public_id as string,
      width: r.width as number | undefined,
      height: r.height as number | undefined,
      createdAt: r.created_at as string,
    }));
    // Newest first — most likely what you're looking for.
    items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "No se pudo listar Cloudinary." }, { status: 500 });
  }
}
