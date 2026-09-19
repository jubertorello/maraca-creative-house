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

export type CloudinaryAsset = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  createdAt: string;
};

/** Every asset in the Cloudinary account — images and videos both, paginated
 * past Cloudinary's 500-per-page cap, not scoped to the "maraca" folder our
 * own upload widget uses (a file added straight from Cloudinary's own
 * console, in some other folder, still needs to show up here). Safe to list
 * unscoped: this account is dedicated to this one site. Powers /admin/media
 * (the "is this file used anywhere?" gallery); MediaLibraryPicker's own
 * listing stays on the lighter single-type route (`/api/admin/media`) since
 * it only ever needs one kind at a time. */
export async function listAllCloudinaryAssets(): Promise<CloudinaryAsset[]> {
  const cl = configuredCloudinary();
  const assets: CloudinaryAsset[] = [];

  for (const resourceType of ["image", "video"] as const) {
    let cursor: string | undefined;
    do {
      const result = await cl.api.resources({
        type: "upload",
        resource_type: resourceType,
        max_results: 500,
        next_cursor: cursor,
      });
      for (const r of result.resources as Array<Record<string, unknown>>) {
        assets.push({
          url: r.secure_url as string,
          publicId: r.public_id as string,
          resourceType,
          width: r.width as number | undefined,
          height: r.height as number | undefined,
          bytes: r.bytes as number | undefined,
          format: r.format as string | undefined,
          createdAt: r.created_at as string,
        });
      }
      cursor = result.next_cursor as string | undefined;
    } while (cursor);
  }

  assets.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return assets;
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
