import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MahFrend",
  description: "Lending management for friends and family — built with heart.",
  openGraph: {
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "MahFrend - Lending management for friends and family — built with heart.",
      },
    ],
  },
  twitter: {
    images: ["/opengraph-image.png"],
  },
  verification: {
    google:
      "GMcVpONj52EFs9XZdPUCX7lgCJ8x7lR1W-C3pnx5G1w", // Paste the code from Search Console here
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
      <Analytics />
      <SpeedInsights />
    </html>
  );
}
