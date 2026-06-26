import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const url = req.nextUrl;

  if (url.pathname === "/success" && url.searchParams.has("_ptxn")) {
    const checkoutUrl = new URL("/checkout", req.url);
    checkoutUrl.searchParams.set("_ptxn", url.searchParams.get("_ptxn") || "");
    return NextResponse.redirect(checkoutUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/success"],
};
