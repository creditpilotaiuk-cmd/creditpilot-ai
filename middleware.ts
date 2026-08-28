import { type NextRequest, NextResponse } from "next/server";

const canonicalHost = "creditpilotai.co.uk";

export default function middleware(request: NextRequest) {
  if (request.nextUrl.hostname !== `www.${canonicalHost}`) return NextResponse.next();

  const canonicalUrl = request.nextUrl.clone();
  canonicalUrl.hostname = canonicalHost;
  canonicalUrl.port = "";
  canonicalUrl.protocol = "https:";
  return NextResponse.redirect(canonicalUrl, 308);
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
