"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Market = {
  name?: string;
  nameBn?: string;
  price?: number;
  today?: number;
};

type Product = {
  id: string | number;
  slug?: string;
  nameBn?: string;
  categoryNameBn?: string;
  category?: string;
  image?: string;
  unit?: string;
  today?: number;
  yesterday?: number;
  lastWeek?: number;
  lastMonth?: number;
  change?: {
    dir?: string;
    pct?: number;
  };
  markets?: Market[];
};

const API_URL =
  "https://api.api-store.workers.dev/api/bazardor/products";

export default function ProductDetails({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("পণ্যের তথ্য লোড করা যায়নি।");
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("পণ্যের তথ্য সঠিক নয়।");
        }

        const found = (data as Product[]).find(
          (item) =>
            String(item.id) === id ||
            String(item.slug) === id
        );

        if (!found) {
          setError("পণ্যটি খুঁজে পাওয়া যায়নি।");
          return;
        }

        setProduct(found);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "কিছু একটা সমস্যা হয়েছে।");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="animate-pulse text-lg text-gray-500">
          পণ্যের তথ্য লোড হচ্ছে...
        </p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {error || "পণ্যটি পাওয়া যায়নি"}
        </h1>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 text-white"
        >
          হোম পেজে ফিরে যান
        </Link>
      </main>
    );
  }

  const priceChange = Number(product.change?.pct ?? 0);
  const isUp = product.change?.dir === "up";
  const isDown = product.change?.dir === "down";

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-8 inline-block text-sm font-medium text-green-700 hover:underline"
      >
        ← হোম পেজে ফিরে যান
      </Link>

      <section className="grid gap-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10 md:grid-cols-2">
        <div className="flex min-h-64 items-center justify-center rounded-2xl bg-green-50 text-8xl">
          {product.image || "🛒"}
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-3 text-sm font-semibold text-green-700">
            {product.categoryNameBn || product.category || "অন্যান্য"}
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {product.nameBn || "পণ্যের নাম"}
          </h1>

          <p className="mt-4 text-sm text-gray-500">
            একক: {product.unit || "kg"}
          </p>

          <p className="mt-6 text-3xl font-bold text-gray-900">
            {Number(product.today ?? 0).toLocaleString("bn-BD")} টাকা
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
            {priceChange.toLocaleString("bn-BD")}% গত দিনের তুলনায়
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">গতকালের দাম</p>
              <p className="mt-2 font-bold text-gray-900">
                {Number(product.yesterday ?? 0).toLocaleString("bn-BD")} টাকা
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">গত সপ্তাহের দাম</p>
              <p className="mt-2 font-bold text-gray-900">
                {Number(product.lastWeek ?? 0).toLocaleString("bn-BD")} টাকা
              </p>
            </div>

            <div className="col-span-2 rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">গত মাসের দাম</p>
              <p className="mt-2 font-bold text-gray-900">
                {Number(product.lastMonth ?? 0).toLocaleString("bn-BD")} টাকা
              </p>
            </div>
          </div>

          {product.markets && product.markets.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-bold text-gray-900">
                বাজারভিত্তিক দাম
              </h2>

              <div className="divide-y divide-gray-200 rounded-xl border border-gray-200">
                {product.markets.map((market, index) => (
                  <div
                    key={`${market.nameBn ?? market.name ?? "market"}-${index}`}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <span className="text-sm text-gray-700">
                      {market.nameBn || market.name || `বাজার ${index + 1}`}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {Number(market.price ?? market.today ?? 0).toLocaleString("bn-BD")} টাকা
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}