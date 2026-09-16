import type { Metadata } from "next";
import "./globals.css";
import { HelpChatLauncher } from "@/components/help-chat-launcher";

export const metadata: Metadata = {
  title: "CreditPilot AI | Credit control beyond your accounting software",
  description: "CreditPilot complements your accounting software with a prioritised daily action list, payment-promise tracking and controlled customer follow-ups.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<HelpChatLauncher /></body></html>;
}
