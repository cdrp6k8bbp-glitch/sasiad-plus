import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import SessionInactivityLogout from "@/components/SessionInactivityLogout";
import SiteFooter from "@/components/SiteFooter";
import { auth } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sąsiad+",
  description: "Pożyczaj rzeczy i pomagaj sąsiadom w swojej okolicy.",
  applicationName: "Sąsiad+",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sąsiad+",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegistration />
        <SessionInactivityLogout sessionUserId={session?.user.id ?? null} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
