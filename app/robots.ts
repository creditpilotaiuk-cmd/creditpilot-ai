import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/customers", "/invoices", "/reminders", "/payments", "/settings"] }, sitemap: "/sitemap.xml" };
}
