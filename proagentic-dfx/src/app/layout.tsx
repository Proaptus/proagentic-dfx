import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Notifications } from "@/components/ui/Notifications";
import { ThemeProvider } from "@/lib/theme";
import { HelpProvider, HelpPanel } from "@/components/help";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "H2 Tank Designer - AI-Powered Optimization",
  description: "Design and optimize hydrogen storage tanks with AI-powered multi-objective optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <HelpProvider>
            {children}
            <HelpPanel />
            <Notifications />
          </HelpProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
