import React from "react";
import type { Metadata } from "next";
import { Anton } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/theme-context";
import { UserProvider } from "../context/usercontext";
import ServiceWorkerProvider from "@/components/service-worker-provider";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";

const antonFont = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

export const metadata: Metadata = {
  title: "NOTI",
  description: "A Firebase-powered note-taking PWA.",
  manifest: '/manifest.json',
  themeColor: '#1a202c',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "NOTI",
    startupImage: [
      {
        url: '/logo.png',
      },
    ],
  },
  icons: {
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${antonFont.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <ServiceWorkerProvider>
              <Navbar/>
              {children}
            </ServiceWorkerProvider>
            <Toaster richColors position="top-right" />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}