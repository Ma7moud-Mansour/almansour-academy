import { and, eq, gt, lt } from "drizzle-orm";
import { getDb } from "../../../../db";
import { studentPasswordResets, studentSessions, students } from "../../../../db/schema";
import { hashPassword } from "../../../student-auth";
import { hashVerificationCode } from "../../../verification-email";

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = String(body.email ?? "").trim().toLowerCase();
    const code = String(body.code ?? "").replace(/\D/g, "");
    const password = String(body.password ?? "");
    if (!/^\d{6}$/.test(code)) return error("اكتب الكود المكوّن من 6 أرقام", 400);
    if (password.length < 8) return error("كلمة المرور الجديدة يجب ألا تقل عن 8 حروف", 400);

    const db = getDb();
    const [reset] = await db.select({
      id: studentPasswordResets.id, studentId: studentPasswordResets.studentId,
      codeHash: studentPasswordResets.codeHash, attempts: studentPasswordResets.attempts,
      expiresAt: studentPasswordResets.expiresAt,
    }).from(studentPasswordResets).innerJoin(students, eq(studentPasswordResets.studentId, students.id))
      .where(and(eq(students.email, email), eq(students.active, true))).limit(1);
    if (!reset || reset.expiresAt <= new Date()) return error("الكود غير صحيح أو انتهت صلاحيته. اطلب كودًا جديدًا", 400);
    if (reset.attempts >= MAX_ATTEMPTS) return error("تجاوزت عدد المحاولات. اطلب كودًا جديدًا", 429);

    const suppliedHash = await hashVerificationCode(email, code);
    if (suppliedHash !== reset.codeHash) {
      await db.update(studentPasswordResets).set({ attempts: reset.attempts + 1, updatedAt: new Date() }).where(eq(studentPasswordResets.id, reset.id));
      return error(`الكود غير صحيح. متبقي ${MAX_ATTEMPTS - reset.attempts - 1} محاولات`, 400);
    }

    const passwordData = await hashPassword(password);
    await db.transaction(async (tx) => {
      const [consumed] = await tx.delete(studentPasswordResets).where(and(
        eq(studentPasswordResets.id, reset.id), eq(studentPasswordResets.codeHash, suppliedHash),
        gt(studentPasswordResets.expiresAt, new Date()), lt(studentPasswordResets.attempts, MAX_ATTEMPTS),
      )).returning({ id: studentPasswordResets.id });
      if (!consumed) throw new Error("Password reset is no longer valid");
      await tx.update(students).set({ passwordHash: passwordData.hash, passwordSalt: passwordData.salt, updatedAt: new Date() }).where(eq(students.id, reset.studentId));
      await tx.delete(studentSessions).where(eq(studentSessions.studentId, reset.studentId));
    });
    return Response.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (cause) {
    console.error("Password reset failed", cause);
    return error("تعذر تغيير كلمة المرور الآن، حاول مرة أخرى", 500);
  }
}

const error = (message: string, status: number) => Response.json({ error: message }, { status });
