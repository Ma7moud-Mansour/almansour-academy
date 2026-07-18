import { and, eq, gt, lt } from "drizzle-orm";
import { getDb } from "../../../../db";
import { pendingStudentRegistrations, students } from "../../../../db/schema";
import { hashVerificationCode } from "../../../verification-email";

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = String(body.email ?? "").trim().toLowerCase();
    const code = String(body.code ?? "").replace(/\D/g, "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) return error("اكتب كود التأكيد المكوّن من 6 أرقام", 400);

    const db = getDb();
    const [pending] = await db.select().from(pendingStudentRegistrations).where(eq(pendingStudentRegistrations.email, email)).limit(1);
    if (!pending) return error("طلب التسجيل غير موجود. ابدأ التسجيل من جديد", 404);
    if (pending.verificationExpiresAt <= new Date()) return error("انتهت صلاحية الكود. اطلب كودًا جديدًا", 410);
    if (pending.verificationAttempts >= MAX_ATTEMPTS) return error("تجاوزت عدد المحاولات. اطلب كودًا جديدًا", 429);

    const suppliedHash = await hashVerificationCode(email, code);
    if (suppliedHash !== pending.verificationCodeHash) {
      await db.update(pendingStudentRegistrations).set({ verificationAttempts: pending.verificationAttempts + 1, updatedAt: new Date() }).where(eq(pendingStudentRegistrations.id, pending.id));
      return error(`الكود غير صحيح. متبقي ${MAX_ATTEMPTS - pending.verificationAttempts - 1} محاولات`, 400);
    }

    const student = await db.transaction(async (tx) => {
      const [stillPending] = await tx.select().from(pendingStudentRegistrations).where(and(
        eq(pendingStudentRegistrations.id, pending.id),
        eq(pendingStudentRegistrations.verificationCodeHash, suppliedHash),
        gt(pendingStudentRegistrations.verificationExpiresAt, new Date()),
        lt(pendingStudentRegistrations.verificationAttempts, MAX_ATTEMPTS),
      )).limit(1);
      if (!stillPending) throw new Error("Verification request is no longer valid");
      const [created] = await tx.insert(students).values({
        fullName: stillPending.fullName, email: stillPending.email, phone: stillPending.phone,
        academicYear: stillPending.academicYear, governorate: stillPending.governorate,
        guardianOccupation: stillPending.guardianOccupation, guardianPhone: stillPending.guardianPhone,
        passwordHash: stillPending.passwordHash, passwordSalt: stillPending.passwordSalt,
        emailVerifiedAt: new Date(),
      }).returning({ id: students.id, fullName: students.fullName, email: students.email });
      await tx.delete(pendingStudentRegistrations).where(eq(pendingStudentRegistrations.id, stillPending.id));
      return created;
    });

    return Response.json({ student, message: "تم تأكيد بريدك وإنشاء حسابك بنجاح" }, { status: 201 });
  } catch (cause) {
    console.error("Email verification failed", cause);
    return error("تعذر تأكيد البريد الآن، حاول مرة أخرى", 500);
  }
}

const error = (message: string, status: number) => Response.json({ error: message }, { status });
