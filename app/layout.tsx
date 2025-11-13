
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/app-sidebar";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Aplicación flexi IoT gripo 3",
  description: "Una aplicación con Supabase",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} $ antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative">
            <main className="relative flex">
              <LeftSidebar />
              {/* className="text-white-1" Lado izquirdo */}
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
