
import type { Metadata } from "next";
import { Geist, Ubuntu } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/app-sidebar";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Aplicación flexi IoT",
  description: "Una aplicación con Supabase para control de sensores IoT",
};

const geistSans = Ubuntu({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} $ antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="">
            <main className="flex">
              <LeftSidebar />
              <div className="w-full">
                <Navbar />
                <div className="p-4">
                  {children}
                </div>
                <Toaster />
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
