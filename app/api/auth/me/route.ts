import { getStudent } from "../../../student-session";

export async function GET() {
  const student = await getStudent();
  return Response.json({ student }, { headers: { "Cache-Control": "no-store" } });
}
