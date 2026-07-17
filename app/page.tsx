"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const Icon = ({ name }: { name: string }) => {
  const paths: Record<string, React.ReactNode> = {
    play: <><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/></>,
    code: <><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
};

const fallbackCourses = [
  { tag: "البداية الصح", title: "أساسيات البرمجة", desc: "ابدأ من الصفر وابني طريقة تفكير المبرمج خطوة بخطوة.", lessons: "24 درس", level: "مبتدئ", icon: "</>" },
  { tag: "الذكاء الاصطناعي", title: "AI للثانوية", desc: "افهم مفاهيم الذكاء الاصطناعي وطبّقها على مشروعات حقيقية.", lessons: "18 درس", level: "متوسط", icon: "AI" },
  { tag: "تطبيق عملي", title: "حل المشكلات", desc: "تدريبات متدرجة وأسئلة تساعدك تتعامل مع أي مسألة بثقة.", lessons: "30 تدريب", level: "كل المستويات", icon: "{ }" },
];

const fallbackFaqs = [
  ["هل الكورس مناسب لو أنا لسه مبتدئ؟", "أيوه، المنهج بيبدأ معاك من الصفر وبيشرح المفاهيم ببساطة قبل أي تطبيق عملي."],
  ["المحاضرات بتكون لايف ولا مسجلة؟", "فيه محاضرات مباشرة للتفاعل وحل الأسئلة، وكل محاضرة بتكون متاحة مسجلة للمراجعة في أي وقت."],
  ["هل فيه متابعة للواجبات؟", "كل وحدة فيها تدريبات وواجب عملي، مع متابعة دورية وتصحيح يوضحلك نقاط القوة والتحسين."],
];

type ContentResponse = {
  courses?: { tag: string; title: string; description: string; lessonsLabel: string; level: string; icon: string }[];
  faqs?: { question: string; answer: string }[];
  testimonials?: { studentName: string; studentLevel: string; quote: string }[];
};

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [faq, setFaq] = useState(0);
  const [courses, setCourses] = useState(fallbackCourses);
  const [faqs, setFaqs] = useState(fallbackFaqs);
  const [testimonials, setTestimonials] = useState([
    { studentName: "محمد أحمد", studentLevel: "تانية ثانوي", quote: "كنت فاكر البرمجة صعبة جدًا، بس طريقة الشرح خلتني أفهم الفكرة وأحل بإيدي من أول أسبوع." },
    { studentName: "سارة خالد", studentLevel: "أولى ثانوي", quote: "أكتر حاجة فرقت معايا المتابعة. كل سؤال كان بيترد عليه وبدأت أثق في حلي أكتر." },
    { studentName: "عمر مصطفى", studentLevel: "ثالثة ثانوي", quote: "المحتوى منظم ومش بيجري. حسيت إني بتعلم بنفس نظام الجامعة بس بطريقة أبسط." },
  ]);

  useEffect(() => {
    fetch("/api/content")
      .then((response) => response.ok ? response.json() as Promise<ContentResponse> : Promise.reject())
      .then((data) => {
        if (data.courses?.length) setCourses(data.courses.map((course) => ({ tag: course.tag, title: course.title, desc: course.description, lessons: course.lessonsLabel, level: course.level, icon: course.icon })));
        if (data.faqs?.length) setFaqs(data.faqs.map((item: Record<string, string>) => [item.question, item.answer]));
        if (data.testimonials?.length) setTestimonials(data.testimonials);
      })
      .catch(() => undefined);
  }, []);
  const go = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenu(false); };

  return (
    <main dir="rtl">
      <header className="nav-wrap">
        <nav className="nav container" aria-label="التنقل الرئيسي">
          <button className="brand" onClick={() => go("home")} aria-label="الرئيسية">
            <img className="brand-logo" src="/almansour-logo.png" alt="المنصور أكاديمية البرمجة" />
          </button>
          <div className={`nav-links ${menu ? "open" : ""}`}>
            <button onClick={() => go("home")}>الرئيسية</button><button onClick={() => go("courses")}>الكورسات</button><button onClick={() => go("method")}>نظام الدراسة</button><button onClick={() => go("reviews")}>آراء الطلاب</button><button onClick={() => go("faq")}>الأسئلة الشائعة</button><div className="mobile-auth"><Link href="/signin">تسجيل الدخول</Link><Link href="/signup">إنشاء حساب</Link></div>
          </div>
          <div className="auth-nav"><Link href="/signin" className="signin-link">تسجيل الدخول</Link><Link href="/signup" className="nav-cta">إنشاء حساب <Icon name="arrow" /></Link></div>
          <button className="menu-btn" onClick={() => setMenu(!menu)} aria-label="فتح القائمة"><Icon name={menu ? "close" : "menu"} /></button>
        </nav>
      </header>

      <section className="hero" id="home">
        <div className="hero-grid container">
          <div className="hero-copy">
            <div className="eyebrow"><span className="live-dot"/> الحجز مفتوح للعام الدراسي الجديد</div>
            <h1>البرمجة مش مادة<br/><em>البرمجة طريقة تفكير.</em></h1>
            <p>اتعلم البرمجة والذكاء الاصطناعي بأسلوب بسيط وعملي، بمنهج جامعي متدرج ومصمم خصيصًا لطلاب الثانوية.</p>
            <div className="hero-actions"><button className="primary" onClick={() => go("courses")}>ابدأ رحلتك الآن <Icon name="arrow"/></button><button className="watch" onClick={() => go("method")}><span><Icon name="play"/></span> اكتشف نظامنا</button></div>
            <div className="trust"><div className="avatars"><span>م</span><span>ع</span><span>س</span><span>+</span></div><div><b>+350 طالب</b><small>بدأوا رحلتهم معانا</small></div><div className="rating"><Icon name="star"/><b>4.9</b></div></div>
          </div>
          <div className="hero-visual" aria-label="تجربة تعلم البرمجة">
            <div className="orange-shape"></div><div className="dot-grid">•••<br/>•••<br/>•••</div>
            <div className="code-window"><div className="window-top"><i/><i/><i/><span>first_program.py</span></div><pre><span>01</span> <b>def</b> <em>start_journey</em>():{`\n`}<span>02</span>   dream = <q>&quot;مبرمج&quot;</q>{`\n`}<span>03</span>   effort = <q>&quot;كل يوم&quot;</q>{`\n`}<span>04</span>   <b>return</b> dream + effort{`\n\n`}<span>06</span> start_journey()<i className="cursor"/></pre><div className="output"><span>✓</span> أنت جاهز تبدأ!</div></div>
            <div className="float-card card-one"><span><Icon name="code"/></span><div><b>تعلم بالتطبيق</b><small>مش مجرد مشاهدة</small></div></div>
            <div className="float-card card-two"><span><Icon name="users"/></span><div><b>متابعة مستمرة</b><small>إنت مش لوحدك</small></div></div>
          </div>
        </div>
        <div className="hero-strip"><div className="container"><span><Icon name="check"/>شرح بسيط وواضح</span><span><Icon name="check"/>تطبيقات ومشروعات</span><span><Icon name="check"/>متابعة وواجبات</span><span><Icon name="check"/>محتوى متاح 24/7</span></div></div>
      </section>

      <section className="section courses" id="courses"><div className="container"><div className="section-head"><div><span className="kicker">ابدأ من مكانك</span><h2>مسارات مصممة عشان <em>تتفوق</em></h2></div><p>كل مسار بيجمع بين الشرح والتطبيق والمتابعة، عشان تفهم وتعرف تستخدم اللي اتعلمته.</p></div><div className="course-grid">{courses.map((c,i)=><article className="course-card" key={c.title}><div className={`course-icon c${i}`}>{c.icon}</div><span className="course-tag">{c.tag}</span><h3>{c.title}</h3><p>{c.desc}</p><div className="course-meta"><span><Icon name="play"/>{c.lessons}</span><span><Icon name="clock"/>{c.level}</span></div><button onClick={() => go("join")}>اعرف التفاصيل <Icon name="arrow"/></button></article>)}</div></div></section>

      <section className="section method" id="method"><div className="container method-grid"><div className="method-copy"><span className="kicker">نظام المنصور</span><h2>من أول شرح لحد ما<br/><em>تكتب الكود بنفسك</em></h2><p>مش بنحفظك إجابات. بنبني معاك الأساس، وبعدها نخليك تجرب وتغلط وتفهم لحد ما توصل للحل بنفسك.</p><div className="steps">{[["01","افهم الفكرة","شرح مبسط بأمثلة من الواقع"],["02","شوف التطبيق","حل مباشر خطوة بخطوة"],["03","جرّب بنفسك","واجبات وتدريبات متدرجة"],["04","تابع تقدمك","Feedback مستمر على شغلك"]].map(x=><div className="step" key={x[0]}><b>{x[0]}</b><div><h3>{x[1]}</h3><p>{x[2]}</p></div></div>)}</div></div><div className="method-panel"><div className="lesson-head"><span>درس اليوم</span><b>أساسيات الـ Python</b></div><div className="video-box"><button aria-label="تشغيل الدرس"><Icon name="play"/></button><span>08:42</span></div><div className="progress-label"><b>تقدمك في المسار</b><span>68%</span></div><div className="progress"><i/></div><div className="next"><span><Icon name="check"/></span><div><b>خلصت أول 16 درس!</b><small>كمّل، فاضلك 8 دروس على الشهادة</small></div></div></div></div></section>

      <section className="section reviews" id="reviews"><div className="container"><div className="section-head centered"><div><span className="kicker">ناس بدأت قبلك</span><h2>طلابنا بيقولوا إيه؟</h2></div></div><div className="review-grid">{testimonials.map((r,i)=><article className="review-card" key={`${r.studentName}-${i}`}><div className="stars">★★★★★</div><p>“{r.quote}”</p><div className="student"><span>{r.studentName[0]}</span><div><b>{r.studentName}</b><small>{r.studentLevel}</small></div><em>0{i+1}</em></div></article>)}</div></div></section>

      <section className="section faq" id="faq"><div className="container faq-grid"><div><span className="kicker">قبل ما تبدأ</span><h2>أسئلة بتتكرر<br/><em>وإجاباتها</em></h2><p>لو عندك سؤال تاني، كلمنا وإحنا هنرد عليك ونساعدك تختار البداية المناسبة.</p></div><div className="accordion">{faqs.map((x,i)=><div className={`faq-item ${faq===i?"active":""}`} key={x[0]}><button onClick={()=>setFaq(faq===i?-1:i)} aria-expanded={faq===i}><b>{x[0]}</b><span>{faq===i?"−":"+"}</span></button>{faq===i&&<p>{x[1]}</p>}</div>)}</div></div></section>

      <section className="cta-section" id="join"><div className="container cta-box"><div><span>جاهز تبدأ؟</span><h2>مستقبلك في البرمجة<br/>يبدأ من هنا.</h2><p>احجز مكانك دلوقتي وابدأ رحلة حقيقية من الفهم للتطبيق.</p></div><div className="cta-actions"><a href="tel:01099602388" className="cta-white">01099602388 <small>للحجز والاستفسار</small></a><a href="https://wa.me/201099602388" target="_blank" rel="noreferrer" className="cta-outline">تواصل واتساب <Icon name="arrow"/></a></div></div></section>

      <footer><div className="container footer-grid"><div className="footer-brand"><div className="brand"><span className="brand-mark">م</span><span><b>المنصور</b><small>أكاديمية البرمجة</small></span></div><p>تعليم البرمجة والذكاء الاصطناعي لطلاب الثانوية بأسلوب بسيط، عملي، ومستمر.</p></div><div><h4>روابط سريعة</h4><button onClick={()=>go("courses")}>الكورسات</button><button onClick={()=>go("method")}>نظام الدراسة</button><button onClick={()=>go("faq")}>الأسئلة الشائعة</button></div><div><h4>تواصل معنا</h4><a href="tel:01099602388">01099602388</a><a href="https://wa.me/201099602388">WhatsApp</a></div></div><div className="copyright container">© 2026 منصة المنصور — كل الحقوق محفوظة <span>صُنعت بشغف عشان الجيل الجاي</span></div></footer>
    </main>
  );
}
