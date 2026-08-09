import type { Metadata } from "next";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import SessionInactivityLogout from "@/components/SessionInactivityLogout";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegistration />
        <SessionInactivityLogout />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
