
import { NextRequest, NextResponse } from "next/server";

const API_URLS = [
  "https://openapi.programming-hero.com/api/bazardor",
  "https://api.api-store.workers.dev/api/bazardor",
  "https://api.abcz.workers.dev/api/bazardor",
];

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const { path } = await params;
  const endpoint = path.map(encodeURIComponent).join("/");
  const query = request.nextUrl.search;

  for (const baseUrl of API_URLS) {
    try {
      const response = await fetch(
        `${baseUrl}/${endpoint}${query}`,
        { cache: "no-store" }
      );

      if (!response.ok) continue;

      const data = await response.text();

      return new Response(data, {
        status: response.status,
        headers: {
          "Content-Type":
            response.headers.get("Content-Type") ??
            "application/json",
        },
      });
    } catch {
      // Try the next API if this one fails.
    }
  }

  return NextResponse.json(
    { error: "All Bazar Dor APIs are currently unavailable." },
    { status: 502 }
  );
}