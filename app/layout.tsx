import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/src/components/providers/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SUI Daily Assistant - AI-Powered Blockchain Companion",
  description: "An intelligent AI agent designed to serve as a comprehensive daily companion for active users of the SUI blockchain ecosystem. Get real-time market insights, sentiment analysis, and seamless token swapping.",
  keywords: ["sui", "blockchain", "ai", "assistant", "crypto", "defi", "trading", "sentiment analysis", "market intelligence"],
  authors: [{ name: "SUI Daily Assistant Team" }],
  creator: "SUI Daily Assistant Team",
  publisher: "SUI Daily Assistant",
  robots: "index, follow",
  openGraph: {
    title: "SUI Daily Assistant - AI-Powered Blockchain Companion",
    description: "An intelligent AI agent for the SUI blockchain ecosystem. Real-time market insights, sentiment analysis, and seamless token swapping.",
    type: "website",
    locale: "en_US",
    siteName: "SUI Daily Assistant",
  },
  twitter: {
    card: "summary_large_image",
    title: "SUI Daily Assistant - AI-Powered Blockchain Companion",
    description: "An intelligent AI agent for the SUI blockchain ecosystem. Real-time market insights, sentiment analysis, and seamless token swapping.",
    creator: "@sui_daily_assistant",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#00D4FF",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/logo.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* Font Awesome for enhanced UI icons */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js" crossOrigin="anonymous" referrerPolicy="no-referrer"></script>
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
