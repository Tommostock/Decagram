import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Decagram \u2014 Daily 10-Letter Word Puzzle",
  description:
    "Guess the 10-letter word in 3 tries. Choose your letters, reveal the clues, crack the word. A new puzzle every day.",
  keywords: ["word game", "puzzle", "daily", "wordle", "10 letters", "decagram"],
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Decagram \u2014 Daily 10-Letter Word Puzzle",
    description: "Can you crack today's 10-letter word in 3 guesses?",
    type: "website",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Decagram",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
