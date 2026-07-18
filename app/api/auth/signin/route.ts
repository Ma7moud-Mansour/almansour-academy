import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { studentSessions, students } from "../../../../db/schema";
import { hashToken, randomToken, verifyPassword } from "../../../student-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const db = getDb();
    const [student] = await db.select().from(students).where(eq(students.email, email)).limit(1);
    if (!student || !student.active || !(await verifyPassword(password, student.passwordSalt, student.passwordHash))) {
      return Response.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }
    if (!student.emailVerifiedAt) {
      return Response.json({ error: "لازم تأكد بريدك الإلكتروني قبل تسجيل الدخول" }, { status: 403 });
    }

    const token = randomToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(studentSessions).values({ studentId: student.id, tokenHash: await hashToken(token), expiresAt, ipAddress: request.headers.get("x-forwarded-for"), userAgent: request.headers.get("user-agent") });
    await db.update(students).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(students.id, student.id));
    const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
    return new Response(JSON.stringify({ message: "تم تسجيل الدخول بنجاح", student: { id: student.id, fullName: student.fullName } }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": `student_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}` },
    });
  } catch (cause) {
    console.error("Student signin failed", cause);
    return Response.json({ error: "تعذر تسجيل الدخول الآن" }, { status: 500 });
  }
}
