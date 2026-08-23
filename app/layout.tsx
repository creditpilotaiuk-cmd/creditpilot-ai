import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreditPilot AI | Credit control beyond your accounting software",
  description: "CreditPilot complements your accounting software with a prioritised daily action list, payment-promise tracking and controlled customer follow-ups.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
