import { getChatGPTUser } from "./chatgpt-auth";

export async function getAdmin() {
  const user = await getChatGPTUser();
  if (!user) return null;

  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(user.email.toLowerCase()) ? user : null;
}

export async function requireApiAdmin() {
  const admin = await getAdmin();
  if (!admin) {
    return Response.json({ error: "غير مصرح لك بتنفيذ هذا الإجراء" }, { status: 403 });
  }
  return admin;
}
