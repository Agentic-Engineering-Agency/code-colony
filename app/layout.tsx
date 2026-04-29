import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Code Colony",
  description: "Where your repo becomes a living company.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-era="default" data-density="dense">
      <body>{children}</body>
    </html>
  );
}
