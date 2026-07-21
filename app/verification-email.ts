import { hashToken } from "./student-auth";

const CODE_TTL_MINUTES = 10;

export function createVerificationCode() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(values[0] % 1_000_000).padStart(6, "0");
}

export function verificationExpiry() {
  return new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);
}

export function hashVerificationCode(email: string, code: string) {
  return hashToken(`${email}:${code}`);
}

export async function sendVerificationEmail(email: string, fullName: string, code: string) {
  return sendCodeEmail(email, "كود تأكيد حسابك في أكاديمية المنصور", verificationEmailHtml(fullName, code), `أهلاً ${fullName}، كود تأكيد حسابك هو: ${code}. الكود صالح لمدة ${CODE_TTL_MINUTES} دقائق.`);
}

export async function sendPasswordResetEmail(email: string, fullName: string, code: string) {
  return sendCodeEmail(email, "كود إعادة تعيين كلمة المرور", passwordResetEmailHtml(fullName, code), `أهلاً ${fullName}، كود إعادة تعيين كلمة المرور هو: ${code}. الكود صالح لمدة ${CODE_TTL_MINUTES} دقائق.`);
}

async function sendCodeEmail(email: string, subject: string, html: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Resend is not configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject, html, text,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Resend verification email failed", response.status, details);
    throw new Error("Verification email could not be sent");
  }
}

function passwordResetEmailHtml(fullName: string, code: string) {
  const safeName = escapeHtml(fullName);
  return `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f4f6fb;font-family:Arial,sans-serif;color:#14213d"><div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;padding:32px"><h1 style="font-size:24px;margin:0 0 16px">أهلاً ${safeName}</h1><p style="font-size:16px;line-height:1.8">استخدم الكود التالي لإعادة تعيين كلمة المرور:</p><div dir="ltr" style="font-size:34px;font-weight:700;letter-spacing:10px;text-align:center;background:#f0f4ff;border-radius:12px;padding:18px;margin:24px 0">${code}</div><p style="font-size:14px;color:#667085">الكود صالح لمدة ${CODE_TTL_MINUTES} دقائق. لو لم تطلب تغيير كلمة المرور، تجاهل الرسالة ولن يتغير حسابك.</p></div></body></html>`;
}

function verificationEmailHtml(fullName: string, code: string) {
  const safeName = escapeHtml(fullName);
  return `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f4f6fb;font-family:Arial,sans-serif;color:#14213d"><div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;padding:32px"><h1 style="font-size:24px;margin:0 0 16px">أهلاً ${safeName}</h1><p style="font-size:16px;line-height:1.8">استخدم الكود التالي لتأكيد بريدك وإنشاء حسابك في أكاديمية المنصور:</p><div dir="ltr" style="font-size:34px;font-weight:700;letter-spacing:10px;text-align:center;background:#f0f4ff;border-radius:12px;padding:18px;margin:24px 0">${code}</div><p style="font-size:14px;color:#667085">الكود صالح لمدة ${CODE_TTL_MINUTES} دقائق. لو لم تطلب إنشاء الحساب، تجاهل الرسالة.</p></div></body></html>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char] ?? char);
}
