import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { HelpChatLauncher } from "@/components/help-chat-launcher";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "CreditPilot AI | Credit control beyond your accounting software",
  description: "CreditPilot complements your accounting software with a prioritised daily action list, payment-promise tracking and controlled customer follow-ups.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return <html lang="en"><body>{children}{session?.user && <><HelpChatLauncher /><Script id="tawk-live-chat" strategy="afterInteractive">{`var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
Tawk_API.onBeforeLoad=function(){Tawk_API.hideWidget();};
(function(){var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];s1.async=true;s1.src="https://embed.tawk.to/6aaa99692cfcaf3445e66fa4/1k2l6egpu";s1.charset="UTF-8";s1.setAttribute("crossorigin","*");s0.parentNode.insertBefore(s1,s0);})();`}</Script></>}</body></html>;
}
