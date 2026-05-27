import type { Metadata } from "next";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

export const metadata: Metadata = {
  title: "FormCraft",
  description: "Build and share dynamic forms",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
