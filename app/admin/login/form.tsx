"use client";

import { FormEvent, useState } from "react";

export default function AdminLoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/admin/signin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setError(data.error || "تعذر تسجيل الدخول"); setLoading(false); return; }
    window.location.href = "/admin";
  }
  return <form onSubmit={submit}><label>البريد الإلكتروني<input type="email" name="email" required autoComplete="email" /></label><label>كلمة المرور<input type="password" name="password" required minLength={8} autoComplete="current-password" /></label>{error && <p className="error-message">{error}</p>}<button type="submit" disabled={loading}>{loading ? "جاري الدخول..." : "تسجيل الدخول"}</button></form>;
}
