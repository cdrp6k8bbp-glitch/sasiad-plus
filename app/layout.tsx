import type { Metadata } from "next";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import SessionInactivityLogout from "@/components/SessionInactivityLogout";
import SiteFooter from "@/components/SiteFooter";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "sąsiedzi",
    "wypożyczanie sprzętu",
    "pomoc sąsiedzka",
    "lokalne usługi",
    "ogłoszenia lokalne",
  ],
  category: "community",
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Sąsiad+ — wszystko, czego potrzebujesz, jest po sąsiedzku",
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sąsiad+ — lokalna platforma sąsiedzka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sąsiad+ — wszystko, czego potrzebujesz, jest po sąsiedzku",
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
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
