import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JSON Table Viewer",
  description: "View JSON data as a table",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
