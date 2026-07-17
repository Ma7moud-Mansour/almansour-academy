import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { students } from "../../../../db/schema";
import { requireApiAdmin } from "../../../admin-auth";

export const dynamic = "force-dynamic";

const publicFields = {
  id: students.id, fullName: students.fullName, email: students.email, phone: students.phone,
  academicYear: students.academicYear, governorate: students.governorate,
  guardianOccupation: students.guardianOccupation, guardianPhone: students.guardianPhone,
  active: students.active, createdAt: students.createdAt,
};

export async function GET() {
  const auth = await requireApiAdmin();
  if (auth instanceof Response) return auth;
  const rows = await getDb().select(publicFields).from(students).orderBy(desc(students.createdAt), desc(students.id));
  return Response.json({ students: rows });
}

export async function PUT(request: Request) {
  const auth = await requireApiAdmin();
  if (auth instanceof Response) return auth;
  const body = await request.json() as Record<string, unknown>;
  const id = Number(body.id);
  if (!id) return Response.json({ error: "طالب غير صالح" }, { status: 400 });
  const academicYear = String(body.academicYear ?? "");
  if (!new Set(["first", "second"]).has(academicYear)) return Response.json({ error: "السنة الدراسية غير صحيحة" }, { status: 400 });

  await getDb().update(students).set({
    fullName: clean(body.fullName), phone: phone(body.phone), academicYear: academicYear as "first" | "second",
    governorate: clean(body.governorate), guardianOccupation: clean(body.guardianOccupation),
    guardianPhone: phone(body.guardianPhone), active: body.active === true, updatedAt: new Date(),
  }).where(eq(students.id, id));
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await requireApiAdmin();
  if (auth instanceof Response) return auth;
  const body = await request.json() as { id?: number };
  if (!body.id) return Response.json({ error: "طالب غير صالح" }, { status: 400 });
  await getDb().delete(students).where(eq(students.id, body.id));
  return Response.json({ ok: true });
}

const clean = (value: unknown) => String(value ?? "").trim().replace(/\s+/g, " ");
const phone = (value: unknown) => clean(value).replace(/[\s()-]/g, "").replace(/^\+20/, "0");
