import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.API_BASE_URL ?? "https://api.zambeziworks.com/api/v1";
const SA_KEY   = process.env.SUPER_ADMIN_PASSWORD ?? "";

export async function GET() {
  const jar = await cookies();
  if (jar.get("sa_session")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const res = await fetch(`${API_BASE}/super-admin/system`, {
      headers: { "Content-Type": "application/json", "x-super-admin-key": SA_KEY },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
