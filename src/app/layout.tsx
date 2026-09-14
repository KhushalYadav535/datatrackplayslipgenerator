import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DataTrack Payslip Generator | Powered by DataTrack",
  description:
    "Generate, preview, and download executive, bank-compliant employee payslips instantly. Powered by DataTrack.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
