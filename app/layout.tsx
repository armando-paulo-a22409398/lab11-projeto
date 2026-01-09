import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header"; 
// Removemos o import do CartContext e do Provider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DEISI Shop",
  description: "Lab 11 - Projeto React",
};

const data = new Date();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={`${geistSans.variable} ${geistMono.variable} flex flex-col justify-center gap-5 p-20 items-center min-h-screen bg-gray-50`}>
        
        <Header />
        
        <main className="bg-blue-200 p-5 rounded-3xl max-w-8xl w-full min-h-[70vh] shadow-xl">
          {children}
        </main>
        
        <footer className="text-gray-700 text-sm font-medium">DIW {data.getFullYear()}</footer>

      </body>
    </html>
  );
}