import Link from "next/link";
import { requireChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import { getAdmin } from "../admin-auth";
import AdminPanel from "./panel";
import StudentsPanel from "./students-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const admin = await getAdmin();

  if (!admin) {
    return (
      <main className="admin-denied" dir="rtl">
        <div><span>403</span><h1>الحساب غير مصرح له</h1><p>أضف البريد <b>{user.email}</b> إلى متغير البيئة ADMIN_EMAILS.</p><Link href="/">العودة للرئيسية</Link></div>
      </main>
    );
  }

  return (
    <main className="admin-page" dir="rtl">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-logo"><span>م</span><div><b>المنصور</b><small>لوحة الإدارة</small></div></Link>
        <nav><a href="#students">الطلاب</a><a href="#courses">الكورسات</a><a href="#testimonials">آراء الطلاب</a><a href="#faqs">الأسئلة الشائعة</a></nav>
        <div className="admin-user"><b>{admin.displayName}</b><small>{admin.email}</small><a href={chatGPTSignOutPath("/")}>تسجيل الخروج</a></div>
      </aside>
      <section className="admin-content">
        <header><div><span>إدارة المنصة</span><h1>كل المحتوى من مكان واحد</h1></div><Link href="/">مشاهدة الموقع ←</Link></header>
        <StudentsPanel />
        <AdminPanel />
      </section>
    </main>
  );
}
