import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreditPilot AI | Smarter Credit Control. Faster Payments.",
  description: "AI-powered credit control for growing UK businesses.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
