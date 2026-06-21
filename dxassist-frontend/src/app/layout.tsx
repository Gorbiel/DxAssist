// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DxAssist | Medical Diagnostic Platform",
  description: "AI-powered clinical decision support system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {/* Tutaj może dojść globalny Navbar w przyszłości */}
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}