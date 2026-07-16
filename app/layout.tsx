import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "SEAShield — AI-powered scam detection for Singapore SMEs",
  description:
    "SEAShield is a lightweight AI scam-detector that plugs into WhatsApp, email, and calls — flagging phishing, fake invoices, and suspicious payment requests in real time, before employees fall victim.",
  keywords: [
    "scam detection",
    "business email compromise",
    "invoice fraud",
    "SME cybersecurity",
    "Singapore",
    "ASEAN",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-navy-900">{children}</body>
    </html>
  );
}
