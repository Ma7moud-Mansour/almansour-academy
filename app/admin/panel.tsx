"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Resource = "courses" | "faqs" | "testimonials";
type Item = Record<string, string | number | boolean> & { id: number };
type Content = Record<Resource, Item[]>;

const definitions: Record<Resource, { title: string; fields: { key: string; label: string; long?: boolean }[] }> = {
  courses: { title: "الكورسات", fields: [
    { key: "title", label: "اسم الكورس" }, { key: "tag", label: "التصنيف" },
    { key: "description", label: "الوصف", long: true }, { key: "lessonsLabel", label: "عدد الدروس" },
    { key: "level", label: "المستوى" }, { key: "icon", label: "الأيقونة" },
  ] },
  testimonials: { title: "آراء الطلاب", fields: [
    { key: "studentName", label: "اسم الطالب" }, { key: "studentLevel", label: "المرحلة" },
    { key: "quote", label: "رأي الطالب", long: true },
  ] },
  faqs: { title: "الأسئلة الشائعة", fields: [
    { key: "question", label: "السؤال" }, { key: "answer", label: "الإجابة", long: true },
  ] },
};

const empty: Content = { courses: [], faqs: [], testimonials: [] };

export default function AdminPanel() {
  const [content, setContent] = useState<Content>(empty);
  const [editing, setEditing] = useState<{ resource: Resource; item?: Item } | null>(null);
  const [message, setMessage] = useState("جاري تحميل المحتوى...");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/content", { cache: "no-store" });
    const data = await response.json() as Content & { error?: string };
    if (!response.ok) throw new Error(data.error || "تعذر تحميل المحتوى");
    setContent(data); setMessage("");
  }, []);

  useEffect(() => {
    // Loading remote state is the synchronization this effect owns.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch((error) => setMessage(error.message));
  }, [load]);

  async function remove(resource: Resource, id: number) {
    if (!confirm("هل أنت متأكد من حذف هذا المحتوى؟")) return;
    const response = await fetch("/api/admin/content", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resource, id }) });
    if (response.ok) await load(); else setMessage("تعذر حذف العنصر");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const payload = { ...values, resource: editing.resource, id: editing.item?.id, published: values.published === "on" };
    const response = await fetch("/api/admin/content", { method: editing.item ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json() as { error?: string };
    if (!response.ok) return setMessage(data.error || "تعذر حفظ التغييرات");
    setEditing(null); setMessage("تم حفظ التغييرات بنجاح"); await load();
  }

  return <>
    {message && <div className="admin-message">{message}</div>}
    {(Object.keys(definitions) as Resource[]).map((resource) => <section className="admin-section" id={resource} key={resource}>
      <div className="admin-section-head"><div><small>{content[resource].length} عنصر</small><h2>{definitions[resource].title}</h2></div><button onClick={() => setEditing({ resource })}>+ إضافة جديد</button></div>
      <div className="admin-list">{content[resource].map((item) => <article key={item.id}>
        <div className={item.published ? "status live" : "status"}>{item.published ? "منشور" : "مسودة"}</div>
        <div className="admin-item-copy"><b>{String(item.title || item.question || item.studentName)}</b><p>{String(item.description || item.answer || item.quote || "")}</p></div>
        <div className="admin-actions"><button onClick={() => setEditing({ resource, item })}>تعديل</button><button className="danger" onClick={() => remove(resource, item.id)}>حذف</button></div>
      </article>)}</div>
    </section>)}

    {editing && <div className="admin-modal" onMouseDown={(event) => event.target === event.currentTarget && setEditing(null)}><form onSubmit={save}>
      <div className="modal-head"><h2>{editing.item ? "تعديل" : "إضافة"} {definitions[editing.resource].title}</h2><button type="button" onClick={() => setEditing(null)}>×</button></div>
      {definitions[editing.resource].fields.map((field) => <label key={field.key}>{field.label}{field.long
        ? <textarea name={field.key} defaultValue={String(editing.item?.[field.key] ?? "")} required />
        : <input name={field.key} defaultValue={String(editing.item?.[field.key] ?? "")} required={!["tag", "icon", "studentLevel"].includes(field.key)} />}</label>)}
      <div className="form-row"><label>الترتيب<input type="number" name="sortOrder" defaultValue={String(editing.item?.sortOrder ?? content[editing.resource].length)} /></label><label className="publish-check"><input type="checkbox" name="published" defaultChecked={editing.item ? Boolean(editing.item.published) : true} /> منشور على الموقع</label></div>
      <button className="save-button" type="submit">حفظ التغييرات</button>
    </form></div>}
  </>;
}
