import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { pendingStudentRegistrations } from "../../../../db/schema";
import { createVerificationCode, hashVerificationCode, sendVerificationEmail, verificationExpiry } from "../../../verification-email";

const RESEND_DELAY_MS = 60_000;

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = String(body.email ?? "").trim().toLowerCase();
    const db = getDb();
    const [pending] = await db.select().from(pendingStudentRegistrations).where(eq(pendingStudentRegistrations.email, email)).limit(1);
    if (!pending) return error("طلب التسجيل غير موجود. ابدأ التسجيل من جديد", 404);

    const waitSeconds = Math.ceil((pending.lastSentAt.getTime() + RESEND_DELAY_MS - Date.now()) / 1000);
    if (waitSeconds > 0) return error(`استنى ${waitSeconds} ثانية قبل طلب كود جديد`, 429);

    const code = createVerificationCode();
    await db.update(pendingStudentRegistrations).set({
      verificationCodeHash: await hashVerificationCode(email, code),
      verificationExpiresAt: verificationExpiry(), verificationAttempts: 0,
      lastSentAt: new Date(), updatedAt: new Date(),
    }).where(eq(pendingStudentRegistrations.id, pending.id));
    await sendVerificationEmail(email, pending.fullName, code);
    return Response.json({ message: "تم إرسال كود جديد إلى بريدك الإلكتروني" });
  } catch (cause) {
    console.error("Resend verification code failed", cause);
    return error("تعذر إرسال كود جديد الآن، حاول مرة أخرى", 500);
  }
}

const error = (message: string, status: number) => Response.json({ error: message }, { status });
