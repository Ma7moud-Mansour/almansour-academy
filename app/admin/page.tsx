import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "../admin-auth";
import AdminPanel from "./panel";
import StudentsPanel from "./students-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <main className="admin-page" dir="rtl">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-logo"><span>م</span><div><b>المنصور</b><small>لوحة الإدارة</small></div></Link>
        <nav><a href="#students">الطلاب</a><a href="#courses">الكورسات</a><a href="#testimonials">آراء الطلاب</a><a href="#faqs">الأسئلة الشائعة</a></nav>
        <div className="admin-user"><b>{admin.fullName}</b><small>{admin.email} · {admin.role}</small><form action="/api/admin/signout" method="post"><button type="submit">تسجيل الخروج</button></form></div>
      </aside>
      <section className="admin-content">
        <header><div><span>إدارة المنصة</span><h1>كل المحتوى من مكان واحد</h1></div><Link href="/">مشاهدة الموقع ←</Link></header>
        <StudentsPanel />
        <AdminPanel />
      </section>
    </main>
  );
}
