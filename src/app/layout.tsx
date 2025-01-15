import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { UserProvider } from "@/context/userContext";
import { SidebarProvider } from "@/context/SidebarContext"; // Import the SidebarProvider

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

export const metadata: Metadata = {
  title: "Warehouse System",
  description: "David Intern",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-blue-50/40`}>
        {/* Wrap with both UserProvider and SidebarProvider */}
        <UserProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </UserProvider>
      </body>
    </html>
  );
}
