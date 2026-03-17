import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LiveblocksWrapper } from "@/components/providers/liveblocks-provider";
import { UsageProvider } from "@/components/providers/usage-provider";
import "./globals.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-ui/styles/dark/attributes.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeRabbit Clone",
  description: "AI-powered code reviews for Gi`tHub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <UsageProvider>
              <LiveblocksWrapper>
                {children}
              </LiveblocksWrapper>
            </UsageProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
