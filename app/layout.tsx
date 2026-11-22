import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Wall | Your little corner of the internet",
  description: "A classic-style wall for sharing a note with your friends.",
  applicationName: "The Wall",
  openGraph: {
    title: "The Wall",
    description: "A little corner of the internet to say hello.",
    type: "website"
  },
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
