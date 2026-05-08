import { NextResponse } from "next/server";
import { fetchAddons } from "@/lib/api";
import { cookies } from "next/headers";

export async function GET() {
  const jar = await cookies();
  if (jar.get("sa_session")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await fetchAddons();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
