import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "../../../../db";
import { adminSessions } from "../../../../db/schema";
import { hashToken } from "../../../student-auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (token) await getDb().delete(adminSessions).where(eq(adminSessions.tokenHash, await hashToken(token)));
  cookieStore.delete("admin_session");
  return new Response(null, { status: 303, headers: { Location: "/admin/login" } });
}
