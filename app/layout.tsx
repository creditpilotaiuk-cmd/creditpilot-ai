import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreditPilot AI | Credit control beyond your accounting software",
  description: "CreditPilot works alongside your accounting software to prioritise overdue accounts, track payment promises and guide the next collection action.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
