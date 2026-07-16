"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const signup = mode === "signup";
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(signup ? "تم إنشاء الحساب التجريبي بنجاح ✓" : "تم تسجيل الدخول التجريبي بنجاح ✓");
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
          <form onSubmit={submit}>
            {signup && <label>الاسم بالكامل<input required minLength={3} type="text" placeholder="اكتب اسمك" autoComplete="name" /></label>}
            <label>البريد الإلكتروني<input required type="email" placeholder="name@example.com" autoComplete="email" /></label>
            {signup && <label>رقم الموبايل<input required pattern="[0-9]{11}" type="tel" placeholder="01xxxxxxxxx" autoComplete="tel" /></label>}
            <label>كلمة المرور<div className="password-field"><input required minLength={6} type={show ? "text" : "password"} placeholder="6 حروف على الأقل" autoComplete={signup ? "new-password" : "current-password"}/><button type="button" onClick={() => setShow(!show)}>{show ? "إخفاء" : "إظهار"}</button></div></label>
            {!signup && <div className="form-options"><label><input type="checkbox"/> تذكرني</label><button type="button">نسيت كلمة المرور؟</button></div>}
            <button className="auth-submit" type="submit">{signup ? "إنشاء حساب" : "تسجيل الدخول"}<span>←</span></button>
            {message && <p className="success-message" role="status">{message}</p>}
          </form>
          <div className="auth-switch">{signup ? "عندك حساب بالفعل؟" : "لسه معندكش حساب؟"} <Link href={signup ? "/signin" : "/signup"}>{signup ? "سجّل دخول" : "اعمل حساب جديد"}</Link></div>
          <p className="terms">بالمتابعة أنت موافق على شروط الاستخدام وسياسة الخصوصية.</p>
        </div>
      </section>
    </main>
  );
}
