import { NextResponse } from "next/server";
import { updateSubscription, removeSubscription } from "@/lib/api";
import { cookies } from "next/headers";

async function auth() {
  const jar = await cookies();
  return jar.get("sa_session")?.value === "1";
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; subId: string }> },
) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, subId } = await params;
  console.log(`[SA] PATCH subscription businessId=${id} subId=${subId}`);
  try {
    const body = await req.json();
    const data = await updateSubscription(Number(id), Number(subId), body);
    console.log(`[SA] PATCH subscription OK businessId=${id} subId=${subId}`);
    return NextResponse.json(data);
  } catch (e) {
    console.error(`[SA] PATCH subscription ERROR businessId=${id} subId=${subId}:`, (e as Error).message);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; subId: string }> },
) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, subId } = await params;
  console.log(`[SA] DELETE subscription businessId=${id} subId=${subId}`);
  try {
    const data = await removeSubscription(Number(id), Number(subId));
    console.log(`[SA] DELETE subscription OK businessId=${id} subId=${subId} response:`, JSON.stringify(data));
    return NextResponse.json(data);
  } catch (e) {
    console.error(`[SA] DELETE subscription ERROR businessId=${id} subId=${subId}:`, (e as Error).message);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
