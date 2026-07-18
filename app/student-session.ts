import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "../db";
import { studentSessions, students } from "../db/schema";
import { hashToken } from "./student-auth";

export type CurrentStudent = { id: number; fullName: string; email: string };

export async function getStudent(): Promise<CurrentStudent | null> {
  const token = (await cookies()).get("student_session")?.value;
  if (!token) return null;

  const [student] = await getDb()
    .select({ id: students.id, fullName: students.fullName, email: students.email })
    .from(studentSessions)
    .innerJoin(students, eq(studentSessions.studentId, students.id))
    .where(and(
      eq(studentSessions.tokenHash, await hashToken(token)),
      gt(studentSessions.expiresAt, new Date()),
      eq(students.active, true),
    ))
    .limit(1);
  return student ?? null;
}
