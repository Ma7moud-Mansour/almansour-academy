import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "../../../../db";
import { adminSessions } from "../../../../db/schema";
import { hashToken } from "../../../student-auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (token) await getDb().delete(adminSessions).where(eq(adminSessions.tokenHash, await hashToken(token)));
  cookieStore.delete("admin_session");
  return Response.redirect(new URL("/admin/login", request.url), 303);
}
