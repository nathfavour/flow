import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kylrix Flow - Smart Task Navigation",
  description: "The future of task orchestration inside the Kylrix ecosystem.",
  keywords: ["task management", "productivity", "kylrix", "todo", "project management"],
  authors: [{ name: "Kylrix Team" }],
  openGraph: {
    title: "Kylrix Flow - Smart Task Navigation",
    description: "The future of task orchestration inside the Kylrix ecosystem.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable} ${spaceGrotesk.variable}`}>

      <head>
        <link rel="preconnect" href="https://fra.cloud.appwrite.io" />
      </head>
      <body>
        <AppProviders>
          <MainLayout>
            {children}
          </MainLayout>
        </AppProviders>
      </body>
    </html>
  );
}
