import { v2 as cloudinary } from "cloudinary";

export const CLOUDINARY_ENABLED = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

export function configuredCloudinary() {
  if (!CLOUDINARY_ENABLED) {
    throw new Error(
      "Cloudinary no está configurado — faltan CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET en .env.local.",
    );
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

const CLOUDINARY_URL_RE =
  /^https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/;

/**
 * Deletes the Cloudinary asset behind a URL, if it actually is one — used
 * when an entity that "owns" an uploaded image/video is deleted (a team
 * member, a client logo, a case's media) so the file doesn't linger in
 * Cloudinary forever. A no-op for local (/media/...) or non-Cloudinary
 * URLs, and any failure here is logged but swallowed — losing track of one
 * orphaned asset is a much smaller problem than failing the actual delete
 * the editor asked for.
 */
export async function deleteCloudinaryAssetByUrl(
  url: string | undefined | null,
): Promise<void> {
  if (!url || !CLOUDINARY_ENABLED) return;
  const match = url.match(CLOUDINARY_URL_RE);
  if (!match) return;

  const [, resourceType, publicId] = match;
  try {
    await configuredCloudinary().uploader.destroy(publicId, {
      resource_type: resourceType as "image" | "video",
    });
  } catch (err) {
    console.warn(`No se pudo borrar el asset de Cloudinary (${url}):`, err);
  }
}
