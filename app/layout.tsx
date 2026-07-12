import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { getServerSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "TransitOps — Smart Fleet & Dispatch Logistics",
  description: "Real-time dispatch lifecycle tracking, maintenance scheduling, and operational expense auditing.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex bg-white text-zinc-900 font-sans">
        {session ? (
          <div className="flex w-full h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-full">
              <Navbar />
              <main className="flex-1 overflow-y-auto bg-white p-6 sm:p-8">
                {children}
              </main>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-screen bg-white overflow-y-auto">
            {children}
          </div>
        )}
      </body>
    </html>
  );
}
