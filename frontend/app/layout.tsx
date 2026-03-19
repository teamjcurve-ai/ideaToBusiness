import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
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
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '16px',
              padding: '12px 20px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
