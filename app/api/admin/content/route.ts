import { asc, eq } from "drizzle-orm";
import { requireApiAdmin } from "../../../admin-auth";
import { getDb } from "../../../../db";
import { courses, faqs, testimonials } from "../../../../db/schema";

export const dynamic = "force-dynamic";

type Resource = "courses" | "faqs" | "testimonials";
type Payload = Record<string, unknown> & { resource?: Resource; id?: number };

const text = (value: unknown) => String(value ?? "").trim();
const number = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;
const boolean = (value: unknown) => value === true || value === 1 || value === "true" || value === "1";

export async function GET() {
  const auth = await requireApiAdmin();
  if (auth instanceof Response) return auth;
  const db = getDb();
  const [courseRows, faqRows, testimonialRows] = await Promise.all([
    db.select().from(courses).orderBy(asc(courses.sortOrder), asc(courses.id)),
    db.select().from(faqs).orderBy(asc(faqs.sortOrder), asc(faqs.id)),
    db.select().from(testimonials).orderBy(asc(testimonials.sortOrder), asc(testimonials.id)),
  ]);
  return Response.json({ courses: courseRows, faqs: faqRows, testimonials: testimonialRows });
}

export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if (auth instanceof Response) return auth;
  const body = await request.json() as Payload;
  const db = getDb();

  if (body.resource === "courses") {
    if (!text(body.title) || !text(body.description)) return invalid();
    const [row] = await db.insert(courses).values({
      tag: text(body.tag), title: text(body.title), slug: slug(text(body.title)), description: text(body.description),
      lessonsLabel: text(body.lessonsLabel), level: text(body.level), icon: text(body.icon) || "</>",
      sortOrder: number(body.sortOrder), published: boolean(body.published),
    }).returning();
    return Response.json({ item: row }, { status: 201 });
  }
  if (body.resource === "faqs") {
    if (!text(body.question) || !text(body.answer)) return invalid();
    const [row] = await db.insert(faqs).values({ question: text(body.question), answer: text(body.answer), sortOrder: number(body.sortOrder), published: boolean(body.published) }).returning();
    return Response.json({ item: row }, { status: 201 });
  }
  if (body.resource === "testimonials") {
    if (!text(body.studentName) || !text(body.quote)) return invalid();
    const [row] = await db.insert(testimonials).values({ studentName: text(body.studentName), studentLevel: text(body.studentLevel), quote: text(body.quote), sortOrder: number(body.sortOrder), published: boolean(body.published) }).returning();
    return Response.json({ item: row }, { status: 201 });
  }
  return invalid();
}

export async function PUT(request: Request) {
  const auth = await requireApiAdmin();
  if (auth instanceof Response) return auth;
  const body = await request.json() as Payload;
  const id = number(body.id);
  if (!id) return invalid();
  const db = getDb();
  const updatedAt = new Date();

  if (body.resource === "courses") {
    await db.update(courses).set({ tag: text(body.tag), title: text(body.title), description: text(body.description), lessonsLabel: text(body.lessonsLabel), level: text(body.level), icon: text(body.icon) || "</>", sortOrder: number(body.sortOrder), published: boolean(body.published), updatedAt }).where(eq(courses.id, id));
  } else if (body.resource === "faqs") {
    await db.update(faqs).set({ question: text(body.question), answer: text(body.answer), sortOrder: number(body.sortOrder), published: boolean(body.published), updatedAt }).where(eq(faqs.id, id));
  } else if (body.resource === "testimonials") {
    await db.update(testimonials).set({ studentName: text(body.studentName), studentLevel: text(body.studentLevel), quote: text(body.quote), sortOrder: number(body.sortOrder), published: boolean(body.published), updatedAt }).where(eq(testimonials.id, id));
  } else return invalid();
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await requireApiAdmin();
  if (auth instanceof Response) return auth;
  const body = await request.json() as Payload;
  const id = number(body.id);
  if (!id) return invalid();
  const db = getDb();
  if (body.resource === "courses") await db.delete(courses).where(eq(courses.id, id));
  else if (body.resource === "faqs") await db.delete(faqs).where(eq(faqs.id, id));
  else if (body.resource === "testimonials") await db.delete(testimonials).where(eq(testimonials.id, id));
  else return invalid();
  return Response.json({ ok: true });
}

function invalid() {
  return Response.json({ error: "البيانات المطلوبة غير مكتملة" }, { status: 400 });
}

function slug(value: string) {
  const base = value.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
  return `${base || "course"}-${Date.now().toString(36)}`;
}
