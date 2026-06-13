import type { Metadata } from "next";
import Script from "next/script";
import { Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const siteName = "LeetCode Question Randomizer";
const siteDescription =
  "Randomly get LeetCode questions to practice on.";

const manrope = Manrope({
  variable: "--font-manrope",
  weight: "500",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "LeetCode question randomizer",
    "LeetCode random problem",
    "coding interview practice",
    "Blind 75",
    "NeetCode 150",
    "algorithms",
    "data structures",
    "technical interview prep",
  ],
  authors: [{ name: "larry" }],
  creator: "larry",
  publisher: "larry",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName,
    title: siteName,
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: siteName,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: siteName,
  description: siteDescription,
  url: siteUrl,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};
const structuredDataJson = JSON.stringify(structuredData).replace(/</g, "\\u003c");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} dark theme-ready h-full scrollbar-none antialiased`}
    >
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {structuredDataJson}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
