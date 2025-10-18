import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Computer Vision App",
  description: "A Next.js application for computer vision projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="/opencv-loader.js" strategy="beforeInteractive" />
      </head>
      <body className="antialiased">
        {children}
        <Script
          src="https://docs.opencv.org/4.x/opencv.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
