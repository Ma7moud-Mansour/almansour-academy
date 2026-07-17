import { redirect } from "next/navigation";
import { getAdmin } from "../../admin-auth";
import AdminLoginForm from "./form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  return <main className="admin-login-page" dir="rtl"><section><div className="admin-logo"><span>م</span><div><b>المنصور</b><small>دخول الإدارة</small></div></div><h1>أهلًا بك في لوحة الإدارة</h1><p>استخدم حساب الأدمن لإدارة المنصة.</p><AdminLoginForm /></section></main>;
}
