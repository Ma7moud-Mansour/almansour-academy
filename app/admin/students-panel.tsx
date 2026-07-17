"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Student = {
  id: number; fullName: string; email: string; phone: string; academicYear: "first" | "second";
  governorate: string; guardianOccupation: string; guardianPhone: string; active: boolean; createdAt: string;
};

export default function StudentsPanel() {
  const [students, setStudents] = useState<Student[]>([]);
  const [editing, setEditing] = useState<Student | null>(null);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/students", { cache: "no-store" });
    const data = await response.json() as { students?: Student[]; error?: string };
    if (!response.ok) throw new Error(data.error || "تعذر تحميل الطلاب");
    setStudents(data.students ?? []);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch((error) => setMessage(error.message));
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/admin/students", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, id: editing.id, active: values.active === "on" }) });
    const data = await response.json() as { error?: string };
    if (!response.ok) return setMessage(data.error || "تعذر حفظ بيانات الطالب");
    setEditing(null); setMessage("تم تحديث بيانات الطالب"); await load();
  }

  async function remove(id: number) {
    if (!confirm("حذف حساب الطالب نهائيًا؟")) return;
    const response = await fetch("/api/admin/students", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (response.ok) await load(); else setMessage("تعذر حذف الطالب");
  }

  return <section className="admin-section" id="students">
    <div className="admin-section-head"><div><small>{students.length} طالب</small><h2>الطلاب المسجلون</h2></div></div>
    {message && <div className="admin-message">{message}</div>}
    <div className="admin-list">{students.map((student) => <article key={student.id}>
      <div className={student.active ? "status live" : "status"}>{student.active ? "نشط" : "موقوف"}</div>
      <div className="admin-item-copy"><b>{student.fullName}</b><p>{student.email} · {student.phone} · {student.academicYear === "first" ? "أولى ثانوي" : "تانية ثانوي"} · {student.governorate}</p></div>
      <div className="admin-actions"><button onClick={() => setEditing(student)}>تعديل</button><button className="danger" onClick={() => remove(student.id)}>حذف</button></div>
    </article>)}</div>
    {editing && <div className="admin-modal"><form onSubmit={save}>
      <div className="modal-head"><h2>تعديل بيانات الطالب</h2><button type="button" onClick={() => setEditing(null)}>×</button></div>
      <label>الاسم<input name="fullName" defaultValue={editing.fullName} required /></label>
      <label>الموبايل<input name="phone" defaultValue={editing.phone} required /></label>
      <label>السنة<select name="academicYear" defaultValue={editing.academicYear}><option value="first">أولى ثانوي</option><option value="second">تانية ثانوي</option></select></label>
      <label>المحافظة<input name="governorate" defaultValue={editing.governorate} required /></label>
      <label>مهنة ولي الأمر<input name="guardianOccupation" defaultValue={editing.guardianOccupation} required /></label>
      <label>موبايل ولي الأمر<input name="guardianPhone" defaultValue={editing.guardianPhone} required /></label>
      <label className="publish-check"><input type="checkbox" name="active" defaultChecked={editing.active} /> الحساب نشط</label>
      <button className="save-button" type="submit">حفظ التغييرات</button>
    </form></div>}
  </section>;
}
