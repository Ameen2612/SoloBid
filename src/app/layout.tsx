import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoloBid",
  description: "Professional quotes in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-900">
        {children}
      </body>
    </html>
  );
}