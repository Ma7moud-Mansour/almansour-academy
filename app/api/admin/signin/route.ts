import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { adminSessions, admins } from "../../../../db/schema";
import { hashPassword, hashToken, randomToken, verifyPassword } from "../../../student-auth";

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email || !password) return Response.json({ error: "أدخل البريد وكلمة المرور" }, { status: 400 });
  const db = getDb();

  let [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  if (!admin) {
    const existing = await db.select({ id: admins.id }).from(admins).limit(1);
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
    const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    if (!existing.length && email === bootstrapEmail && password === bootstrapPassword && password.length >= 12) {
      const passwordData = await hashPassword(password);
      [admin] = await db.insert(admins).values({ fullName: process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "مدير المنصة", email, role: "super_admin", passwordHash: passwordData.hash, passwordSalt: passwordData.salt }).returning();
    }
  }
  if (!admin || !admin.active || !(await verifyPassword(password, admin.passwordSalt, admin.passwordHash))) return Response.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });

  const token = randomToken();
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  await db.transaction(async (tx) => {
    await tx.insert(adminSessions).values({ adminId: admin.id, tokenHash: await hashToken(token), expiresAt });
    await tx.update(admins).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(admins.id, admin.id));
  });
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", "Set-Cookie": `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1209600${secure}` } });
}
