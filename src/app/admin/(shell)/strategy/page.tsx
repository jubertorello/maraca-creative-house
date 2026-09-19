import { readSiteContent } from "@/lib/admin-data";
import StrategyManager from "./StrategyManager";

export default async function AdminStrategyPage() {
  const content = await readSiteContent("strategy");
  return <StrategyManager content={content} />;
}
