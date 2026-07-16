import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";
import "@fontsource/tajawal/800.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;

  return {
    title: "منصة المنصور | تعلم البرمجة",
    description: "منصة المنصور لتعليم البرمجة والذكاء الاصطناعي لطلاب الثانوية.",
    openGraph: { title: "منصة المنصور", description: "البرمجة طريقة تفكير", images: [image], locale: "ar_EG", type: "website" },
    twitter: { card: "summary_large_image", title: "منصة المنصور", description: "البرمجة طريقة تفكير", images: [image] },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
