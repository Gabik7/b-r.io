import { Analytics } from "@vercel/analytics/react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";

import Navigation from "@/app/components/Navigation";
import { ThemeProvider } from "@/app/components/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://gfcodes.com"),
  title: "Gabriel Falis",
  description:
    "Full stack developer and primarily a mobile app developer based in Europe, Slovakia",
  openGraph: {
    title: "Gabriel Falis",
    url: "https://gfcodes.com/",
    images: [
      { url: "https://gfcodes.com/api/og?title=GFCODES.com", alt: "gfcodes.com" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="width-full bg-white text-primary antialiased dark:bg-black">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navigation />
          <div className="mx-auto max-w-[700px] px-6 pb-24 pt-16 md:px-6 md:pb-44 md:pt-20">
            {children}
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
