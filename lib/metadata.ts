import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const siteConfig = {
  name: "Faktur",
  title: "Faktur - Invoice Management Made Simple",
  description:
    "Create, manage, and track invoices effortlessly. A streamlined invoice management solution designed for businesses of all sizes. Built with Next.js, featuring PDF generation, payment tracking, and client management.",
  url: siteUrl,
  ogImage: `${siteUrl}/og-image.jpg`,
  keywords: [
    "invoice management",
    "invoice software",
    "billing system",
    "invoice generator",
    "PDF invoice",
    "payment tracking",
    "client management",
    "business invoicing",
    "invoice maker",
    "free invoice software",
    "Next.js invoice app",
    "modern invoicing",
  ],
  creator: "Metker",
  authors: [{ name: "Metker" }],
};

export const sharedMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@faktur",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
};

/**
 * Helper function to create custom metadata for specific pages
 * Merges custom metadata with shared base metadata
 *
 * @example
 * ```tsx
 * // In a page.tsx file
 * import { createMetadata } from "@/lib/metadata";
 *
 * export const metadata = createMetadata({
 *   title: "Dashboard",
 *   description: "Manage your invoices and track payments",
 *   openGraph: {
 *     images: ["/dashboard-preview.jpg"],
 *   },
 * });
 * ```
 */
export function createMetadata(custom?: Partial<Metadata>): Metadata {
  return {
    ...sharedMetadata,
    ...custom,
    openGraph: {
      ...sharedMetadata.openGraph,
      ...custom?.openGraph,
    },
    twitter: {
      ...sharedMetadata.twitter,
      ...custom?.twitter,
    },
  };
}
