"use client";

// import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AppWalletProvider from "./components/AppWalletProvider";
import { Toaster } from 'sonner';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// export const metadata: Metadata = {
//   title: "Find My cat",
//   description: "This app is to rescue the lost cat and win prices",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
         <AppWalletProvider>{children}</AppWalletProvider>
      </body>
    </html>
  );
}
