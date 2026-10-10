import { NextResponse } from "next/server";

const API_BASES = [
  "https://api.api-store.workers.dev/api/bazardor",
  "https://api.abcz.workers.dev/api/bazardor",
];

export async function GET() {
  for (const base of API_BASES) {
    try {
      const response = await fetch(`${base}/products`, {
        cache: "no-store",
      });

      if (!response.ok) continue;

      const data = await response.json();
      return NextResponse.json(data);
    } catch {
      continue;
    }
  }

  return NextResponse.json(
    { error: "পণ্যের তথ্য লোড করা যায়নি।" },
    { status: 502 }
  );
}