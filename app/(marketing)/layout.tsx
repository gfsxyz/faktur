import type { Metadata } from "next";
import "../globals.css";
import { Geist } from "next/font/google";
import { sharedMetadata } from "@/lib/metadata";

export const metadata: Metadata = sharedMetadata;

const fontFamily = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans antialiased dark ${fontFamily.className} ${fontFamily.style}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 bg-[url('/noise.webp')] bg-repeat bg-size-[120px_120px] opacity-[0.035]"
        />
        {children}
      </body>
    </html>
  );
}
