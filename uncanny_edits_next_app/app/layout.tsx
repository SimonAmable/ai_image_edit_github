import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/AppSidebar"

import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "./components/theme-provider"


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PixelPerfect.ai",
  description: "PixelPerfect.ai is a platform that lets anyone creating and editing high-quality images with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background antialiased`}
        // suppressHydrationWarning={true}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <SidebarProvider >
          <AppSidebar />
          <main className="flex-1 w-full min-w-0">
            <Header />
            {children}
          </main>
            <Toaster richColors position="top-center" />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
