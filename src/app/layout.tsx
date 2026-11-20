import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "KaryaSetu — Find Trusted Indian Freelancers For Your Next Project",
  description:
    "India's premier regulated freelance marketplace. Hire verified Indian developers, designers, CAs, and AI engineers with milestone escrow protection, Section 194-O TDS automation, and digital contracts.",
  keywords: [
    "Indian Freelancers",
    "Hire Developers India",
    "Freelance Marketplace India",
    "Milestone Escrow",
    "Section 194-O TDS",
    "Bengaluru Software Engineers",
    "Verified Freelancers India",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
