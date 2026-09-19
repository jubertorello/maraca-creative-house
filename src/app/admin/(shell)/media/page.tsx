import { listAllCloudinaryAssets } from "@/lib/cloudinary";
import { getAllMediaUsage } from "@/lib/media-usage";
import MediaGalleryManager, { type GalleryItem } from "./MediaGalleryManager";

export default async function AdminMediaPage() {
  const [assets, usageMap] = await Promise.all([
    listAllCloudinaryAssets(),
    getAllMediaUsage(),
  ]);

  const items: GalleryItem[] = assets.map((a) => ({
    ...a,
    usage: usageMap.get(a.url) ?? [],
  }));

  return <MediaGalleryManager items={items} />;
}
