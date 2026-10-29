import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocMind — AI Document Assistant",
  description:
    "Upload documents and chat with grounded, cited answers powered by retrieval-augmented generation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-base-950 text-base-100 antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
