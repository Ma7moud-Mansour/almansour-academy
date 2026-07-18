import { eq, or } from "drizzle-orm";
import { getDb } from "../../../../db";
import { pendingStudentRegistrations, students } from "../../../../db/schema";
import { hashPassword } from "../../../student-auth";
import { createVerificationCode, hashVerificationCode, sendVerificationEmail, verificationExpiry } from "../../../verification-email";

const years = new Set(["first", "second"]);
const governorates = new Set([
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم", "الغربية",
  "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "السويس", "أسوان", "أسيوط",
  "بني سويف", "بورسعيد", "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر",
  "قنا", "شمال سيناء", "سوهاج",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const fullName = clean(body.fullName);
    const email = clean(body.email).toLowerCase();
    const phone = normalizePhone(body.phone);
    const academicYear = clean(body.academicYear);
    const governorate = clean(body.governorate);
    const guardianOccupation = clean(body.guardianOccupation);
    const guardianPhone = normalizePhone(body.guardianPhone);
    const password = String(body.password ?? "");

    if (fullName.length < 5 || !fullName.includes(" ")) return error("اكتب الاسم بالكامل", 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error("البريد الإلكتروني غير صحيح", 400);
    if (!isEgyptianPhone(phone) || !isEgyptianPhone(guardianPhone)) return error("رقم الموبايل يجب أن يكون رقمًا مصريًا صحيحًا", 400);
    if (!years.has(academicYear)) return error("اختر السنة الدراسية", 400);
    if (!governorates.has(governorate)) return error("اختر المحافظة", 400);
    if (guardianOccupation.length < 2) return error("اكتب مهنة ولي الأمر", 400);
    if (password.length < 8) return error("كلمة المرور يجب ألا تقل عن 8 حروف", 400);

    const db = getDb();
    const duplicate = await db.select({ email: students.email, phone: students.phone })
      .from(students).where(or(eq(students.email, email), eq(students.phone, phone))).limit(1);
    if (duplicate.length) return error(duplicate[0].email === email ? "البريد الإلكتروني مسجل بالفعل" : "رقم الموبايل مسجل بالفعل", 409);

    const [existingPending] = await db.select({ email: pendingStudentRegistrations.email, lastSentAt: pendingStudentRegistrations.lastSentAt })
      .from(pendingStudentRegistrations).where(or(eq(pendingStudentRegistrations.email, email), eq(pendingStudentRegistrations.phone, phone))).limit(1);
    if (existingPending) {
      const waitSeconds = Math.ceil((existingPending.lastSentAt.getTime() + 60_000 - Date.now()) / 1000);
      if (waitSeconds > 0 && existingPending.email === email) {
        return Response.json({ email, verificationRequired: true, message: "الكود اتبعت بالفعل، اكتبه لتأكيد حسابك" }, { status: 202 });
      }
      if (waitSeconds > 0) return error(`استنى ${waitSeconds} ثانية قبل طلب كود جديد`, 429);
    }

    const passwordData = await hashPassword(password);
    const code = createVerificationCode();
    const codeHash = await hashVerificationCode(email, code);
    await db.delete(pendingStudentRegistrations).where(or(eq(pendingStudentRegistrations.email, email), eq(pendingStudentRegistrations.phone, phone)));
    const [pending] = await db.insert(pendingStudentRegistrations).values({
      fullName, email, phone, academicYear: academicYear as "first" | "second", governorate,
      guardianOccupation, guardianPhone, passwordHash: passwordData.hash, passwordSalt: passwordData.salt,
      verificationCodeHash: codeHash, verificationExpiresAt: verificationExpiry(), lastSentAt: new Date(),
    }).returning({ id: pendingStudentRegistrations.id });

    try {
      await sendVerificationEmail(email, fullName, code);
    } catch (cause) {
      await db.delete(pendingStudentRegistrations).where(eq(pendingStudentRegistrations.id, pending.id));
      throw cause;
    }

    return Response.json({ email, verificationRequired: true, message: "بعتنالك كود تأكيد من 6 أرقام على بريدك الإلكتروني" }, { status: 202 });
  } catch (cause) {
    console.error("Student signup failed", cause);
    return error("تعذر إنشاء الحساب الآن، حاول مرة أخرى", 500);
  }
}

const clean = (value: unknown) => String(value ?? "").trim().replace(/\s+/g, " ");
const normalizePhone = (value: unknown) => clean(value).replace(/[\s()-]/g, "").replace(/^\+20/, "0");
const isEgyptianPhone = (value: string) => /^01[0125]\d{8}$/.test(value);
const error = (message: string, status: number) => Response.json({ error: message }, { status });
