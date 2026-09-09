import { NextRequest, NextResponse } from "next/server";
import { configuredCloudinary, CLOUDINARY_ENABLED } from "@/lib/cloudinary";

export const runtime = "nodejs";

/** Signs an upload for the Cloudinary Upload Widget (see
 * src/app/admin/(shell)/CloudinaryUploadButton.tsx). The widget uploads
 * straight from the browser to Cloudinary — this route only proves the
 * request is authorized (signed with our API secret) without ever
 * exposing that secret to the browser. */
export async function POST(req: NextRequest) {
  if (!CLOUDINARY_ENABLED) {
    return NextResponse.json(
      { error: "Cloudinary no está conectado todavía." },
      { status: 501 },
    );
  }

  const { paramsToSign } = (await req.json()) as { paramsToSign: Record<string, unknown> };
  const cloudinary = configuredCloudinary();
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  );

  return NextResponse.json({
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
