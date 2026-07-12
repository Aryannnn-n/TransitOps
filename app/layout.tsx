import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TransitOps — Smart Fleet & Dispatch Logistics",
  description: "Real-time dispatch lifecycle tracking, maintenance scheduling, and operational expense auditing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50 font-sans">{children}</body>
    </html>
  );
}
