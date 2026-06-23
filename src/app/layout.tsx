import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/shared/Sidebar";
import MobileNav from "@/components/shared/MobileNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Reviewer.AI — Automated Code Review",
    template: "%s | Reviewer.AI",
  },
  description:
    "AI-powered pull request reviews that detect bugs, security risks, and performance issues in real time. Built for world-class engineering teams.",
  keywords: [
    "AI code review",
    "automated PR review",
    "code quality",
    "security scanning",
    "developer tools",
  ],
  metadataBase: new URL("https://reviewer.ai"),
  openGraph: {
    title: "Reviewer.AI — Automated Code Review",
    description:
      "Detect bugs, security risks, and performance issues before they reach production.",
    type: "website",
    siteName: "Reviewer.AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reviewer.AI",
    description: "AI-powered pull request reviews for modern engineering teams.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#08080d" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f8f8fa" media="(prefers-color-scheme: light)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex bg-[--bg-base] text-[--text-primary] dark:bg-[--bg-base] dark:text-[--text-primary]">
        {/* Desktop Sidebar — hidden on mobile */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 w-full min-h-screen overflow-x-hidden transition-all duration-300">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </body>
    </html>
  );
}
