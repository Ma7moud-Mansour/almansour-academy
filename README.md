# منصة المنصور

منصة تعليمية عربية مبنية بـ Next.js وPostgreSQL وDrizzle ORM، ومهيأة للنشر على أي استضافة Node.js مثل Hostinger.

## التشغيل المحلي

المتطلبات:

- Node.js 22 أو أحدث
- PostgreSQL 15 أو أحدث، محليًا أو عبر Supabase/Neon

انسخ `.env.example` إلى `.env.local` واضبط `DATABASE_URL` وبيانات أول حساب أدمن، ثم شغّل:

```bash
npm install
npm run db:migrate
npm run dev
```

أول تسجيل ناجح في `/admin/login` باستخدام قيم `ADMIN_BOOTSTRAP_*` ينشئ حساب `super_admin` إذا لم يوجد أي أدمن.

## الأوامر

- `npm run dev`: تشغيل التطوير
- `npm run build`: بناء نسخة الإنتاج
- `npm start`: تشغيل نسخة الإنتاج
- `npm test`: فحص TypeScript وESLint
- `npm run db:generate`: إنشاء migration بعد تعديل الجداول
- `npm run db:migrate`: تطبيق migrations على PostgreSQL
- `npm run db:studio`: فتح واجهة Drizzle Studio

## قاعدة البيانات

المخطط داخل `db/schema.ts` ويشمل الإدارة والطلاب والكورسات والوحدات والدروس والتسجيلات والتقدم والكويزات والأسئلة والإجابات والمحاولات والواجبات والتسليمات والإعلانات وسجل عمليات الإدارة.

## النشر على Hostinger

اربط مستودع GitHub كتطبيق Node.js/Next.js، وأضف متغيرات البيئة الموجودة في `.env.example`. استخدم أمر البناء `npm run build` وأمر التشغيل `npm start`، وطبّق `npm run db:migrate` قبل تشغيل أول نسخة.

على Hostinger VPS مع CloudPanel: أنشئ Node.js Site بإصدار Node 22 ومنفذ داخلي مثل 3000، ثم شغّل `bash scripts/deploy-hostinger.sh` من مجلد المشروع. ملف `ecosystem.config.cjs` يحافظ على تشغيل التطبيق عبر PM2.
