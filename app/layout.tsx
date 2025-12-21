import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers";
import { MainLayout } from "@/components/layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WhisperrFlow - Smart Task Navigation",
  description: "The future of task orchestration inside the Whisperr ecosystem.",
  keywords: ["task management", "productivity", "whisperr", "todo", "project management"],
  authors: [{ name: "Whisperr Team" }],
  openGraph: {
    title: "WhisperrFlow - Smart Task Navigation",
    description: "The future of task orchestration inside the Whisperr ecosystem.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <AppProviders>
          <MainLayout>
            {children}
          </MainLayout>
        </AppProviders>
      </body>
    </html>
  );
}
