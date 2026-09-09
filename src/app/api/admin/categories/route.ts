import { NextResponse } from "next/server";
import { readCategories } from "@/lib/admin-data";

export async function GET() {
  return NextResponse.json(await readCategories());
}
