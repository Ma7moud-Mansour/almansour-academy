import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { courses, faqs, testimonials } from "../../../db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const [courseRows, faqRows, testimonialRows] = await Promise.all([
      db.select().from(courses).where(eq(courses.published, true)).orderBy(asc(courses.sortOrder), asc(courses.id)),
      db.select().from(faqs).where(eq(faqs.published, true)).orderBy(asc(faqs.sortOrder), asc(faqs.id)),
      db.select().from(testimonials).where(eq(testimonials.published, true)).orderBy(asc(testimonials.sortOrder), asc(testimonials.id)),
    ]);

    return Response.json({ courses: courseRows, faqs: faqRows, testimonials: testimonialRows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر تحميل المحتوى";
    return Response.json({ error: message }, { status: 503 });
  }
}
