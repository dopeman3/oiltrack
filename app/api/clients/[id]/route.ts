import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

type ServiceRecord = {
  oilChangeDate: string;
  currentKm: number;
  dueKm: number;
  airFilter?: boolean;
  oilFilter?: boolean;
  oilQuantity?: number | null;
  oilBrand?: string;
  acFilter?: boolean;
  brakeService?: boolean;
  brakeShoe?: boolean;
  archivedAt: Date;
};

type ClientDoc = {
  ownerId: string;
  name: string;
  phone: string;
  car: string;
  oilChangeDate: string;
  currentKm: number;
  dueKm: number;
  airFilter?: boolean;
  oilFilter?: boolean;
  oilQuantity?: number | null;
  oilBrand?: string;
  acFilter?: boolean;
  brakeService?: boolean;
  brakeShoe?: boolean;
  nextReminderAt: string;
  history: ServiceRecord[];
  createdAt: Date;
};

async function getOwnerId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ownerId = await getOwnerId();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const coll = db.collection<ClientDoc>("clients");

  let _id: ObjectId;
  try { _id = new ObjectId(id); } catch { return NextResponse.json({ error: "Bad id" }, { status: 400 }); }

  const filter = { _id, ownerId };
  const client = await coll.findOne(filter);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.action === "snooze") {
    // Reminder was just sent → push next reminder 14 days out
    const next = new Date();
    next.setDate(next.getDate() + 14);
    await coll.updateOne(filter, { $set: { nextReminderAt: next.toISOString() } });

  } else if (body.action === "edit") {
    // Correct customer info (no archiving, no reminder change)
    await coll.updateOne(filter, {
      $set: { name: body.name, phone: body.phone, car: body.car || "" },
    });

  } else if (body.action === "service") {
    // New oil change: archive the current record, set the new one, reset reminder to 1 month
    const next = new Date(body.oilChangeDate);
    next.setMonth(next.getMonth() + 1);
    await coll.updateOne(filter, {
      $push: {
        history: {
          oilChangeDate: client.oilChangeDate,
          currentKm: client.currentKm,
          dueKm: client.dueKm,
          airFilter: client.airFilter ?? false,
          oilFilter: client.oilFilter ?? false,
          oilQuantity: client.oilQuantity ?? null,
          oilBrand: client.oilBrand ?? "",
          acFilter: client.acFilter ?? false,
          brakeService: client.brakeService ?? false,
          brakeShoe: client.brakeShoe ?? false,
          archivedAt: new Date(),
        },
      },
      $set: {
        oilChangeDate: body.oilChangeDate,
        currentKm: Number(body.currentKm),
        dueKm: Number(body.dueKm),
        airFilter: Boolean(body.airFilter),
        oilFilter: Boolean(body.oilFilter),
        oilQuantity: body.oilQuantity ? Number(body.oilQuantity) : null,
        oilBrand: body.oilBrand || "",
        acFilter: Boolean(body.acFilter),
        brakeService: Boolean(body.brakeService),
        brakeShoe: Boolean(body.brakeShoe),
        nextReminderAt: next.toISOString(),
      },
    });

  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const updated = await coll.findOne(filter);
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ownerId = await getOwnerId();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let _id: ObjectId;
  try { _id = new ObjectId(id); } catch { return NextResponse.json({ error: "Bad id" }, { status: 400 }); }

  await db.collection<ClientDoc>("clients").deleteOne({ _id, ownerId });
  return NextResponse.json({ ok: true });
}