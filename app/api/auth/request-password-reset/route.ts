import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { studentPasswordResets, students } from "../../../../db/schema";
import { createVerificationCode, hashVerificationCode, sendPasswordResetEmail, verificationExpiry } from "../../../verification-email";

const GENERIC_MESSAGE = "لو البريد مسجل عندنا، هيوصلك كود إعادة التعيين خلال دقائق";
const RESEND_DELAY_MS = 60_000;

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ message: GENERIC_MESSAGE });

    const db = getDb();
    const [student] = await db.select({ id: students.id, fullName: students.fullName })
      .from(students).where(and(eq(students.email, email), eq(students.active, true))).limit(1);
    if (!student) return Response.json({ message: GENERIC_MESSAGE });

    const [existing] = await db.select().from(studentPasswordResets).where(eq(studentPasswordResets.studentId, student.id)).limit(1);
    if (existing && existing.lastSentAt.getTime() + RESEND_DELAY_MS > Date.now()) return Response.json({ message: GENERIC_MESSAGE });

    const code = createVerificationCode();
    const values = {
      codeHash: await hashVerificationCode(email, code), expiresAt: verificationExpiry(),
      attempts: 0, lastSentAt: new Date(), updatedAt: new Date(),
    };
    await db.insert(studentPasswordResets).values({ studentId: student.id, ...values })
      .onConflictDoUpdate({ target: studentPasswordResets.studentId, set: values });
    try {
      await sendPasswordResetEmail(email, student.fullName, code);
    } catch (cause) {
      await db.delete(studentPasswordResets).where(eq(studentPasswordResets.studentId, student.id));
      throw cause;
    }
    return Response.json({ message: GENERIC_MESSAGE });
  } catch (cause) {
    console.error("Password reset request failed", cause);
    return Response.json({ message: GENERIC_MESSAGE });
  }
}
