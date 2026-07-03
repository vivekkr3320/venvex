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
  title: "VENVEX Core | Suite of Single-Purpose Software Modules",
  description: "Venvex is a zero-bloat software ecosystem. We engineer razor-sharp, isolated micro-utilities designed to replace massive, heavy platforms with lightning-fast execution layers.",
  keywords: ["VENVEX", "Invoicely", "Route", "Webhook Engine", "Micro-modules", "Developer Utilities", "Edge Computing"],
  authors: [{ name: "VENVEX Core Team" }],
  openGraph: {
    title: "VENVEX Core | High-Performance Software Modules",
    description: "Venvex is a zero-bloat software ecosystem. We engineer razor-sharp, isolated micro-utilities built for absolute speed.",
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

