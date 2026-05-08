import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.API_BASE_URL ?? "https://api.zambeziworks.com/api/v1";
const SA_KEY   = process.env.SUPER_ADMIN_PASSWORD ?? "";

async function auth() {
  const jar = await cookies();
  return jar.get("sa_session")?.value === "1";
}

export async function GET(req: Request) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();

  try {
    const res = await fetch(`${API_BASE}/super-admin/audit-logs${qs ? `?${qs}` : ""}`, {
      headers: { "Content-Type": "application/json", "x-super-admin-key": SA_KEY },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const olderThanDays = searchParams.get("olderThanDays") ?? "30";

  try {
    const res = await fetch(
      `${API_BASE}/super-admin/audit-logs?olderThanDays=${olderThanDays}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-super-admin-key": SA_KEY },
      },
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
