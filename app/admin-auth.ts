import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "../db";
import { adminSessions, admins } from "../db/schema";
import { hashToken } from "./student-auth";

export async function getAdmin() {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return null;
  const tokenHash = await hashToken(token);
  const [admin] = await getDb()
    .select({ id: admins.id, fullName: admins.fullName, email: admins.email, role: admins.role })
    .from(adminSessions)
    .innerJoin(admins, eq(adminSessions.adminId, admins.id))
    .where(and(eq(adminSessions.tokenHash, tokenHash), gt(adminSessions.expiresAt, new Date()), eq(admins.active, true)))
    .limit(1);
  return admin ?? null;
}

export async function requireApiAdmin() {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "غير مصرح لك بتنفيذ هذا الإجراء" }, { status: 401 });
  return admin;
}
