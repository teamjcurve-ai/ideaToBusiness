import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ideaToBusiness - AI 기반 제품 개발 도구",
  description: "AI를 활용한 아이디어를 비즈니스로 만드는 파이프라인",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
