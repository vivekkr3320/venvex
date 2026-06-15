import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UtilityOS Hub | Micro-SaaS Tool Grid & Infrastructure",
  description: "Single-purpose code. Zero operational bloat. UtilityOS deploys lightning-fast, hyper-focused micro-utilities exactly when you need them.",
  keywords: ["UtilityOS", "Micro-SaaS", "Micro-tools", "Invoice Generator", "Developer Utilities", "Vercel", "Serverless Edge"],
  authors: [{ name: "UtilityOS Team" }],
  openGraph: {
    title: "UtilityOS Hub | Micro-SaaS Tool Grid",
    description: "Single-purpose code. Zero operational bloat. Discover lightweight, edge-native single-purpose micro-utilities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} scroll-smooth`}>
      <body className="bg-dark-bg text-white font-sans antialiased min-h-screen flex flex-col selection:bg-accent-emerald selection:text-dark-bg">
        {children}
      </body>
    </html>
  );
}

