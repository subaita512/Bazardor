
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Market = {
  market?: string;
  division?: string;
  name?: string;
  nameBn?: string;
  price?: number | string;
  today?: number | string;
  min?: number | string;
  max?: number | string;
  minPrice?: number | string;
  maxPrice?: number | string;
};

type Product = {
  id: string | number;
  slug?: string;
  name?: string;
  nameBn?: string;
  description?: string;
  descriptionBn?: string;
  category?: string;
  categoryNameBn?: string;
  emoji?: string;
  image?: string;
  unit?: string;
  today?: number | string;
  yesterday?: number | string;
  lastWeek?: number | string;
  lastMonth?: number | string;
  minPrice?: number | string;
  maxPrice?: number | string;
  averagePrice?: number | string;
  change?: {
    dir?: string;
    direction?: string;
    pct?: number | string;
    percentage?: number | string;
  };
  markets?: Market[];
  [key: string]: unknown;
};

const API_BASES = ["/api/bazardor"];

function getNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") return undefined;

  const normalized = value
    .replace(/[০-৯]/g, (digit) =>
      String("০১২৩৪৫৬৭৮৯".indexOf(digit))
    )
    .replace(/[^\d.-]/g, "");

  if (!normalized) return undefined;

  const number = Number(normalized);
  return Number.isFinite(number) ? number : undefined;
}

function money(value: unknown): string {
  const number = getNumber(value);

  if (number === undefined) return "তথ্য নেই";

  return `${number.toLocaleString("bn-BD")} টাকা`;
}

function unwrapProduct(data: unknown): Product | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const obj = data as Record<string, unknown>;

  if (obj.product && typeof obj.product === "object") {
    const nested = unwrapProduct(obj.product);
    if (nested) return nested;
  }

  if (obj.data && typeof obj.data === "object") {
    const nested = unwrapProduct(obj.data);
    if (nested) return nested;
  }

  if ("id" in obj) return obj as Product;

  return null;
}

function unwrapProducts(data: unknown): Product[] {
  if (Array.isArray(data)) return data as Product[];

  if (!data || typeof data !== "object") return [];

  const obj = data as Record<string, unknown>;

  for (const key of ["products", "items", "results", "data"]) {
    const value = obj[key];

    if (Array.isArray(value)) return value as Product[];

    if (value && typeof value === "object") {
      const nested = unwrapProducts(value);
      if (nested.length) return nested;
    }
  }

  return [];
}

function getProductPrice(product: Product): number | undefined {
  return getNumber(
    product.today ??
      product.currentPrice ??
      product.todayPrice ??
      product.price
  );
}

function productName(product: Product): string {
  return (
    product.nameBn ||
    product.name ||
    String(product.title || "পণ্যের নাম")
  );
}

export default function ProductDetails({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);

      let found: Product | null = null;
      let lastError = "পণ্যটি খুঁজে পাওয়া যায়নি।";

      for (const base of API_BASES) {
        if (controller.signal.aborted) return;

        // Try the individual product endpoint first.
        try {
          const response = await fetch(
            `${base}/products/${encodeURIComponent(id)}`,
            {
              signal: controller.signal,
              cache: "no-store",
            }
          );

          if (response.ok) {
            const data: unknown = await response.json();
            const candidate = unwrapProduct(data);

            if (
              candidate &&
              (String(candidate.id) === id ||
                String(candidate.slug) === id)
            ) {
              found = candidate;
            }
          }
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            return;
          }

          lastError = "পণ্যের তথ্য লোড করা যায়নি।";
        }

        if (found) break;

        // If the individual endpoint fails, search the full list.
        try {
          const response = await fetch(`${base}/products`, {
            signal: controller.signal,
            cache: "no-store",
          });

          if (!response.ok) {
            lastError = `API error: ${response.status}`;
            continue;
          }

          const data: unknown = await response.json();
          const list = unwrapProducts(data);

          found =
            list.find(
              (item) =>
                String(item.id) === id || String(item.slug) === id
            ) ?? null;

          if (found) break;

          lastError = "এই ID বা slug-এর কোনো পণ্য পাওয়া যায়নি।";
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            return;
          }

          lastError = "পণ্যের তথ্য লোড করা যায়নি।";
        }
      }

      if (controller.signal.aborted) return;

      if (found) {
        setProduct(found);
      } else {
        setError(lastError);
      }

      setLoading(false);
    }

    void loadProduct();

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/2 rounded bg-gray-200" />
          <div className="h-48 rounded-2xl bg-gray-100" />
          <div className="h-8 w-1/3 rounded bg-gray-200" />
        </div>

        <p className="mt-6 text-center text-gray-500">
          পণ্যের তথ্য লোড হচ্ছে...
        </p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 text-center">
        <div className="text-6xl">🔎</div>

        <h1 className="mt-5 text-2xl font-bold">
          {error || "পণ্যটি পাওয়া যায়নি"}
        </h1>

        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-green-700 px-5 py-3 text-white"
        >
          হোম পেজে ফিরে যান
        </Link>
      </main>
    );
  }

  const markets = Array.isArray(product.markets)
    ? product.markets
    : [];

  const today = getProductPrice(product);

  // Use the API's actual market range fields: min and max.
  const marketMinPrices = markets
    .map((market) => getNumber(market.min ?? market.minPrice))
    .filter(
      (price): price is number =>
        price !== undefined && price > 0
    );

  const marketMaxPrices = markets
    .map((market) => getNumber(market.max ?? market.maxPrice))
    .filter(
      (price): price is number =>
        price !== undefined && price > 0
    );

  const minPrice =
    getNumber(product.minPrice) ??
    (marketMinPrices.length
      ? Math.min(...marketMinPrices)
      : undefined);

  const maxPrice =
    getNumber(product.maxPrice) ??
    (marketMaxPrices.length
      ? Math.max(...marketMaxPrices)
      : undefined);

  // Estimate the average using the midpoint of each market's range.
  const marketMidpoints = markets
    .map((market) => {
      const min = getNumber(market.min ?? market.minPrice);
      const max = getNumber(market.max ?? market.maxPrice);

      if (
        min === undefined ||
        max === undefined ||
        min <= 0 ||
        max <= 0
      ) {
        return undefined;
      }

      return (min + max) / 2;
    })
    .filter((price): price is number => price !== undefined);

  const averagePrice =
    getNumber(product.averagePrice) ??
    (marketMidpoints.length
      ? marketMidpoints.reduce((sum, price) => sum + price, 0) /
        marketMidpoints.length
      : today);

  const direction = String(
    product.change?.dir ?? product.change?.direction ?? ""
  ).toLowerCase();

  const changePct =
    getNumber(
      product.change?.pct ?? product.change?.percentage
    ) ?? 0;

  const isUp = ["up", "increase", "increased"].includes(direction);
  const isDown = ["down", "decrease", "decreased"].includes(direction);

  return (
    <main className="min-h-screen bg-[#f7faf7] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-block text-sm font-semibold text-green-700 hover:underline"
        >
          ← হোম পেজে ফিরে যান
        </Link>

        <section className="mt-6 grid gap-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8 md:grid-cols-2">
          <div className="flex min-h-64 items-center justify-center rounded-2xl bg-green-50 text-8xl">
            {product.emoji || "🛒"}
          </div>

          <div className="flex flex-col justify-center">
            <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              {product.categoryNameBn || product.category || "অন্যান্য"}
            </span>

            <h1 className="mt-4 text-3xl font-extrabold">
              {productName(product)}
            </h1>

            <p className="mt-3 leading-7 text-gray-600">
              {product.descriptionBn ||
                product.description ||
                "এই পণ্যের বাজারদর ও বিভিন্ন বাজারের মূল্য দেখুন।"}
            </p>

            <p className="mt-3 text-sm text-gray-500">
              একক: প্রতি {product.unit || "কেজি"}
            </p>

            <p className="mt-6 text-sm text-gray-500">
              আজকের দাম
            </p>

            <p className="text-3xl font-extrabold text-gray-900">
              {money(today)}
            </p>

            <p
              className={`mt-3 font-semibold ${
                isUp
                  ? "text-red-600"
                  : isDown
                    ? "text-green-700"
                    : "text-gray-500"
              }`}
            >
              {isUp ? "▲" : isDown ? "▼" : "—"}{" "}
              {Math.abs(changePct).toLocaleString("bn-BD")}% গত দিনের তুলনায়
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">দামের সারসংক্ষেপ</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                label: "সর্বনিম্ন দাম",
                value: minPrice,
                color: "text-green-700",
              },
              {
                label: "সর্বোচ্চ দাম",
                value: maxPrice,
                color: "text-red-600",
              },
              {
                label: "গড় দাম",
                value: averagePrice,
                color: "text-gray-900",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <p className="text-sm text-gray-500">{item.label}</p>

                <p className={`mt-2 text-xl font-bold ${item.color}`}>
                  {money(item.value)}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-2 text-xs text-gray-500">
            গড় দাম বাজারগুলোর সর্বনিম্ন ও সর্বোচ্চ দামের মধ্যবর্তী মান থেকে হিসাব করা হয়েছে।
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            বাজারভিত্তিক আজকের দাম
          </h2>

          {markets.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 text-gray-500">
              এই পণ্যের বাজারভিত্তিক দামের তথ্য API-তে পাওয়া যায়নি।
            </p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {markets.map((market, index) => {
                const marketName =
                  market.market ||
                  market.nameBn ||
                  market.name ||
                  `বাজার ${index + 1}`;

                const marketMin = getNumber(
                  market.min ?? market.minPrice
                );

                const marketMax = getNumber(
                  market.max ?? market.maxPrice
                );

                return (
                  <div
                    key={`${marketName}-${index}`}
                    className="flex items-center justify-between gap-4 border-b border-gray-100 p-4 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">
                        🏪 {marketName}
                      </p>

                      {market.division && (
                        <p className="mt-1 text-xs text-gray-500">
                          {market.division}
                        </p>
                      )}

                      {marketMin !== undefined &&
                        marketMax !== undefined && (
                          <p className="mt-1 text-sm text-gray-500">
                            সর্বনিম্ন: {money(marketMin)} – সর্বোচ্চ:{" "}
                            {money(marketMax)}
                          </p>
                        )}
                    </div>

                    <div className="shrink-0 text-right">
                      {marketMin !== undefined &&
                      marketMax !== undefined ? (
                        <>
                          <p className="text-xs text-gray-500">
                            আনুমানিক গড়
                          </p>
                          <p className="font-bold text-green-800">
                            {money((marketMin + marketMax) / 2)}
                          </p>
                        </>
                      ) : (
                        <p className="font-bold text-gray-500">
                          {money(market.price ?? market.today)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "গতকালের দাম", value: product.yesterday },
            { label: "গত সপ্তাহের দাম", value: product.lastWeek },
            { label: "গত মাসের দাম", value: product.lastMonth },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="mt-2 text-lg font-bold">
                {money(item.value)}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}