import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "../../../../db";
import { studentSessions } from "../../../../db/schema";
import { hashToken } from "../../../student-auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("student_session")?.value;
  if (token) await getDb().delete(studentSessions).where(eq(studentSessions.tokenHash, await hashToken(token)));
  cookieStore.delete("student_session");
  return new Response(null, { status: 303, headers: { Location: "/" } });
}
