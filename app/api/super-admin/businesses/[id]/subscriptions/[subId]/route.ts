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
  try {
    const body = await req.json();
    const data = await updateSubscription(Number(id), Number(subId), body);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; subId: string }> },
) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, subId } = await params;
  try {
    const data = await removeSubscription(Number(id), Number(subId));
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
