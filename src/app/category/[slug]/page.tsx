
"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Product = {
  id: string | number;
  slug?: string;
  name?: string;
  nameBn?: string;
  nameBnAlt?: string;
  category?: string;
  categoryNameBn?: string;
  emoji?: string;
  unit?: string;
  today?: number | string;
  price?: number | string;
  currentPrice?: number | string;
  todayPrice?: number | string;
  [key: string]: unknown;
};

type Category = {
  id: string;
  slug: string;
  nameBn: string;
  icon: string;
};

const fallbackCategories: Category[] = [
  { id: "chal", slug: "chal", nameBn: "চাল", icon: "🍚" },
  { id: "dal", slug: "dal", nameBn: "ডাল", icon: "🫘" },
  { id: "tel", slug: "tel", nameBn: "তেল", icon: "🛢️" },
  { id: "sobji", slug: "sobji", nameBn: "সবজি", icon: "🥬" },
  { id: "mach", slug: "mach", nameBn: "মাছ", icon: "🐟" },
  { id: "mangsho", slug: "mangsho", nameBn: "মাংস", icon: "🍗" },
  { id: "dim-dui", slug: "dim-dui", nameBn: "ডিম-দুধ", icon: "🥛" },
  { id: "mosla", slug: "mosla", nameBn: "মসলা", icon: "🌶️" },
];

function getProducts(data: unknown): Product[] {
  if (Array.isArray(data)) return data as Product[];

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    for (const key of ["products", "data", "items", "results"]) {
      const value = obj[key];

      if (Array.isArray(value)) return value as Product[];

      if (value && typeof value === "object") {
        const nested = value as Record<string, unknown>;

        for (const nestedKey of ["products", "items", "results"]) {
          if (Array.isArray(nested[nestedKey])) {
            return nested[nestedKey] as Product[];
          }
        }
      }
    }
  }

  return [];
}

function getPrice(product: Product): number {
  const value =
    product.today ??
    product.currentPrice ??
    product.price ??
    product.todayPrice ??
    0;

  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const normalized = value
      .replace(/[০-৯]/g, (digit) =>
        String("০১২৩৪৫৬৭৮৯".indexOf(digit))
      )
      .replace(/[^\d.-]/g, "");

    return Number(normalized) || 0;
  }

  return 0;
}

function formatPrice(value: number): string {
  return value.toLocaleString("bn-BD", {
    maximumFractionDigits: 2,
  });
}

function getName(product: Product): string {
  return (
    product.nameBn ||
    product.nameBnAlt ||
    product.name ||
    String(product.title || "নাম পাওয়া যায়নি")
  );
}

function matchesCategory(product: Product, slug: string): boolean {
  const category = String(product.category || "").toLowerCase();
  const categoryName = String(product.categoryNameBn || "").toLowerCase();

  const aliases: Record<string, string[]> = {
    chal: ["chal", "rice", "চাল"],
    dal: ["dal", "lentil", "ডাল"],
    tel: ["tel", "oil", "তেল"],
    sobji: ["sobji", "vegetable", "সবজি", "সব্জি"],
    mach: ["mach", "fish", "মাছ"],
    mangsho: ["mangsho", "meat", "chicken", "মাংস"],
    "dim-dui": ["dim-dui", "dim", "egg", "milk", "dui", "ডিম", "দুধ"],
    mosla: ["mosla", "spice", "spices", "মসলা"],
  };

  return (aliases[slug] || [slug]).some(
    (term) => category.includes(term) || categoryName.includes(term)
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f7faf7] px-4">
          <p className="animate-pulse text-lg font-semibold text-green-800">
            ক্যাটাগরির পণ্য লোড হচ্ছে...
          </p>
        </main>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}

function CategoryContent() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch("/api/bazardor/categories", { cache: "no-store" }),
          fetch("/api/bazardor/products", { cache: "no-store" }),
        ]);

        if (!productResponse.ok) {
          throw new Error("পণ্যের তথ্য লোড করা যায়নি।");
        }

        let categories = fallbackCategories;

        if (categoryResponse.ok) {
          const categoryData: unknown = await categoryResponse.json();

          if (Array.isArray(categoryData)) {
            categories = categoryData as Category[];
          }
        }

        const selectedCategory = categories.find(
          (item) => item.slug === slug || item.id === slug
        );

        if (!selectedCategory) {
          if (!cancelled) {
            setCategory(null);
            setProducts([]);
            setError("এই ক্যাটাগরিটি পাওয়া যায়নি।");
            setLoading(false);
          }
          return;
        }

        const productData: unknown = await productResponse.json();
        const allProducts = getProducts(productData);

        const filtered = allProducts.filter((product) =>
          matchesCategory(product, slug)
        );

        if (!cancelled) {
          setCategory(selectedCategory);
          setProducts(filtered);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।");
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7faf7] px-4">
        <p className="animate-pulse text-lg font-semibold text-green-800">
          ক্যাটাগরির পণ্য লোড হচ্ছে...
        </p>
      </main>
    );
  }

  if (error || !category) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f7faf7] px-4 text-center">
        <p className="text-xl font-bold text-gray-800">
          {error || "ক্যাটাগরি পাওয়া যায়নি"}
        </p>
        <Link
          href="/"
          className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-bold text-white"
        >
          হোম পেজে ফিরে যান
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7faf7]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <Link href="/" className="text-xl font-extrabold text-green-800">
            🛒 বাজার দর
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-green-700 px-4 py-2 text-sm font-bold text-green-800 hover:bg-green-50"
          >
            ← হোম পেজ
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-green-100 to-emerald-50 p-6 sm:p-10">
          <p className="text-5xl">{category.icon}</p>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {category.nameBn}
          </h1>
          <p className="mt-3 text-gray-600">
            এই ক্যাটাগরির নিত্যপ্রয়োজনীয় পণ্যের বর্তমান দাম দেখুন।
          </p>
          <p className="mt-2 text-sm text-gray-500">
            মোট পণ্য: {formatPrice(products.length)}
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const identifier = product.slug || product.id;

              return (
                <Link
                  key={product.id}
                  href={`/product/${encodeURIComponent(String(identifier))}`}
                  className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-3xl">
                      {product.emoji || category.icon}
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 group-hover:text-green-700">
                        {getName(product)}
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        প্রতি {product.unit || "একক"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-500">আজকের দাম</p>
                    <p className="mt-1 text-2xl font-extrabold text-green-800">
                      ৳{formatPrice(getPrice(product))}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-green-700">
                      বিস্তারিত দেখুন →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
            <p className="text-4xl">{category.icon}</p>
            <h2 className="mt-3 text-xl font-bold text-gray-800">
              এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              API-তে এই ক্যাটাগরির পণ্য না থাকলে তালিকা খালি থাকবে।
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800"
            >
              সব পণ্য দেখুন
            </Link>
          </div>
        )}
      </section>

      <footer className="mt-8 bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p className="font-extrabold">🛒 বাজার দর</p>
          <p className="mt-2 text-sm text-gray-300">
            প্রয়োজনীয় পণ্যের দাম এক নজরে।
          </p>
          <p className="mt-2 text-xs text-gray-400">
            সকল দাম বাজার পরিস্থিতির ওপর নির্ভর করে পরিবর্তিত হতে পারে।
          </p>
        </div>
      </footer>
    </main>
  );
}