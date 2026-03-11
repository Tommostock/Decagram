import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-context";
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
        <style dangerouslySetInnerHTML={{ __html: `
          html[data-theme="dark"] {
            --bg-glass: rgba(20, 20, 20, 0.8);
            --bg-glass-dense: rgba(15, 15, 15, 0.95);
            --bg-key: rgba(50, 50, 50, 0.8);
            --bg-key-hover: rgba(70, 70, 70, 0.9);
            --bg-subtle: rgba(30, 30, 30, 0.5);
            --bg-header-btn: rgba(255, 255, 255, 0.05);
            --bg-header-btn-hover: rgba(255, 255, 255, 0.1);
            --bg-dist-bar: rgba(30, 30, 30, 0.6);
            --bg-tile-empty: rgba(20, 20, 20, 0.3);
            --bg-keyboard-dock: rgba(10, 10, 10, 0.97);
            --border-keyboard-dock: rgba(255, 255, 255, 0.06);
            --text-key: #d0d0d0;
            --color-gold: #f5c842;
          }
          html[data-theme="light"] {
            --bg-glass: rgba(255, 255, 255, 0.85);
            --bg-glass-dense: rgba(250, 250, 250, 0.97);
            --bg-key: rgba(200, 200, 200, 0.9);
            --bg-key-hover: rgba(170, 170, 170, 0.95);
            --bg-subtle: rgba(210, 210, 210, 0.7);
            --bg-header-btn: rgba(0, 0, 0, 0.05);
            --bg-header-btn-hover: rgba(0, 0, 0, 0.1);
            --bg-dist-bar: rgba(200, 200, 200, 0.6);
            --bg-tile-empty: rgba(220, 220, 220, 0.5);
            --bg-keyboard-dock: rgba(240, 240, 240, 0.97);
            --border-keyboard-dock: rgba(0, 0, 0, 0.1);
            --text-key: #333;
            --color-gold: #b8860b;
          }
          /* Light mode overrides — background/border/color on elements using inline styles */
          html[data-theme="light"] .glass-button {
            background-color: rgba(200, 200, 200, 0.9) !important;
            border-color: rgba(0, 0, 0, 0.1) !important;
            color: #333 !important;
          }
          html[data-theme="light"] .rounded-2xl[style*="backdrop-filter"] {
            background: rgba(255, 255, 255, 0.85) !important;
            border-color: rgba(0, 0, 0, 0.05) !important;
          }
          html[data-theme="light"] .fixed.inset-0[style*="background"] {
            background: rgba(250, 250, 250, 0.97) !important;
          }
        `}} />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
