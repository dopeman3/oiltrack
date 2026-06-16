import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clients = await db
    .collection("clients")
    .find({ ownerId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // First reminder = 1 month after the oil change date
  const first = new Date(body.oilChangeDate);
  first.setMonth(first.getMonth() + 1);

  const doc = {
    ownerId: session.user.id,
    name: body.name,
    phone: body.phone,
    car: body.car || "",
    oilChangeDate: body.oilChangeDate,
    currentKm: Number(body.currentKm),
    dueKm: Number(body.dueKm),
    nextReminderAt: first.toISOString(),
    history: [] as unknown[],
    createdAt: new Date(),
  };

  const result = await db.collection("clients").insertOne(doc);
  return NextResponse.json({ ...doc, _id: result.insertedId });
}