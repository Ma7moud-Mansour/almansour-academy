"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const signup = mode === "signup";
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setMessage(""); setError(""); setLoading(true);
    try {
      const values = Object.fromEntries(new FormData(form));
      const response = await fetch(signup ? "/api/auth/signup" : "/api/auth/signin", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
      });
      const data = await response.json() as { message?: string; error?: string; email?: string; verificationRequired?: boolean };
      if (!response.ok) throw new Error(data.error || "تعذر تنفيذ الطلب");
      setMessage(`${data.message} ✓`);
      if (signup && data.verificationRequired && data.email) setVerificationEmail(data.email);
      if (!signup) {
        router.replace("/");
        router.refresh();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setMessage(""); setError(""); setLoading(true);
    try {
      const code = String(new FormData(e.currentTarget).get("code") ?? "");
      const response = await fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: verificationEmail, code }) });
      const data = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "تعذر تأكيد البريد");
      router.replace("/signin?verified=1");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "حدث خطأ غير متوقع"); }
    finally { setLoading(false); }
  };

  const resendCode = async () => {
    setMessage(""); setError(""); setLoading(true);
    try {
      const response = await fetch("/api/auth/resend-verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: verificationEmail }) });
      const data = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "تعذر إرسال كود جديد");
      setMessage(`${data.message} ✓`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "حدث خطأ غير متوقع"); }
    finally { setLoading(false); }
  };

  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-visual">
        <Link href="/" className="auth-brand"><span>م</span><div><b>المنصور</b><small>أكاديمية البرمجة</small></div></Link>
        <div className="auth-copy"><span className="auth-kicker">ابدأ رحلتك</span><h1>{signup ? <>خطوتك الأولى نحو<br/><em>مستقبل في البرمجة.</em></> : <>أهلاً بيك تاني<br/><em>كمّل من مكانك.</em></>}</h1><p>{signup ? "اعمل حسابك وابدأ تتعلم البرمجة والذكاء الاصطناعي بخطة واضحة ومتابعة مستمرة." : "سجّل دخولك وارجع لدروسك، تدريباتك، وكل اللي وصلتله."}</p></div>
        <div className="auth-code"><div><i/><i/><i/></div><pre><b>student</b> = {`{\n`}  <span>&quot;goal&quot;</span>: <em>&quot;مبرمج&quot;</em>,{`\n`}  <span>&quot;status&quot;</span>: <em>&quot;جاهز يبدأ&quot;</em>{`\n`}{`}`}</pre></div>
        <div className="auth-quote">“كل expert كان في يوم من الأيام مبتدئ.”</div>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <Link href="/" className="back-home">← الرجوع للرئيسية</Link>
          <div className="auth-heading"><span>{signup ? "حساب جديد" : "تسجيل الدخول"}</span><h2>{signup ? "يلا نبدأ!" : "نورت المنصة"}</h2><p>{signup ? "اكتب بياناتك عشان تنضم لطلاب المنصور." : "اكتب بياناتك عشان تدخل على حسابك."}</p></div>
          {signup && verificationEmail ? <form onSubmit={verifyCode}>
            <label>كود التأكيد<input name="code" required minLength={6} maxLength={6} pattern="[0-9]{6}" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" dir="ltr" /></label>
            <p className="full-field">أرسلنا الكود إلى <b dir="ltr">{verificationEmail}</b>. راجع الرسائل غير المرغوب فيها لو مش ظاهر.</p>
            <button className="auth-submit full-field" type="submit" disabled={loading}>{loading ? "جاري التأكيد..." : "تأكيد وإنشاء الحساب"}<span>←</span></button>
            <button className="full-field" type="button" disabled={loading} onClick={resendCode}>إرسال كود جديد</button>
            <button className="full-field" type="button" disabled={loading} onClick={() => { setVerificationEmail(""); setMessage(""); setError(""); }}>تعديل البيانات أو البريد</button>
            {message && <p className="success-message full-field" role="status">{message}</p>}
            {error && <p className="error-message full-field" role="alert">{error}</p>}
          </form> : <form className={signup ? "signup-form" : ""} onSubmit={submit}>
            {signup && <label className="full-field">الاسم بالكامل<input name="fullName" required minLength={5} type="text" placeholder="الاسم الأول واسم العائلة" autoComplete="name" /></label>}
            <label>البريد الإلكتروني<input name="email" required type="email" placeholder="name@example.com" autoComplete="email" /></label>
            {signup && <label>رقم موبايل الطالب<input name="phone" required pattern="01[0125][0-9]{8}" inputMode="numeric" type="tel" placeholder="01xxxxxxxxx" autoComplete="tel" /></label>}
            {signup && <label>السنة الدراسية<select name="academicYear" required defaultValue=""><option value="" disabled>اختر السنة</option><option value="first">أولى ثانوي</option><option value="second">تانية ثانوي</option></select></label>}
            {signup && <label>المحافظة<select name="governorate" required defaultValue=""><option value="" disabled>اختر المحافظة</option>{governorates.map((governorate) => <option key={governorate}>{governorate}</option>)}</select></label>}
            {signup && <label>مهنة ولي الأمر<input name="guardianOccupation" required minLength={2} type="text" placeholder="مثال: مهندس" /></label>}
            {signup && <label>رقم موبايل ولي الأمر<input name="guardianPhone" required pattern="01[0125][0-9]{8}" inputMode="numeric" type="tel" placeholder="01xxxxxxxxx" /></label>}
            <label className={signup ? "full-field" : ""}>كلمة المرور<div className="password-field"><input name="password" required minLength={8} type={show ? "text" : "password"} placeholder="8 حروف على الأقل" autoComplete={signup ? "new-password" : "current-password"}/><button type="button" onClick={() => setShow(!show)}>{show ? "إخفاء" : "إظهار"}</button></div></label>
            {!signup && <div className="form-options"><label><input type="checkbox"/> تذكرني</label><button type="button">نسيت كلمة المرور؟</button></div>}
            <button className="auth-submit full-field" type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : signup ? "إنشاء حساب" : "تسجيل الدخول"}<span>←</span></button>
            {message && <p className="success-message" role="status">{message}</p>}
            {error && <p className="error-message" role="alert">{error}</p>}
          </form>}
          <div className="auth-switch">{signup ? "عندك حساب بالفعل؟" : "لسه معندكش حساب؟"} <Link href={signup ? "/signin" : "/signup"}>{signup ? "سجّل دخول" : "اعمل حساب جديد"}</Link></div>
          <p className="terms">بالمتابعة أنت موافق على شروط الاستخدام وسياسة الخصوصية.</p>
        </div>
      </section>
    </main>
  );
}

const governorates = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم", "الغربية",
  "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "السويس", "أسوان", "أسيوط",
  "بني سويف", "بورسعيد", "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر",
  "قنا", "شمال سيناء", "سوهاج",
];
