/* istanbul ignore file */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sezzle Calculator",
  description: "A full-stack calculator application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
