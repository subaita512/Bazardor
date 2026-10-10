
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Product = {
  id: string | number;
  slug?: string;
  name?: string;
  nameBn?: string;
  nameBnAlt?: string;
  category?: string;
  categoryNameBn?: string;
  image?: string;
  emoji?: string;
  unit?: string;
  today?: number | string;
  yesterday?: number | string;
  lastWeek?: number | string;
  lastMonth?: number | string;
  change?: {
    dir?: string;
    direction?: string;
    pct?: number | string;
    percentage?: number | string;
  };
  [key: string]: unknown;
};

const API_URLS = [
  "https://api.api-store.workers.dev/api/bazardor/products",
  "https://api.abcz.workers.dev/api/bazardor/products",
];

const categories = [
  { id: "all", label: "সব পণ্য", emoji: "🛍️" },
  { id: "chal", label: "চাল", emoji: "🍚" },
  { id: "dal", label: "ডাল", emoji: "🫘" },
  { id: "tel", label: "তেল", emoji: "🫗" },
  { id: "sobji", label: "সবজি", emoji: "🥬" },
  { id: "mach", label: "মাছ", emoji: "🐟" },
  { id: "mangsho", label: "মাংস", emoji: "🍗" },
  { id: "dim", label: "ডিম", emoji: "🥚" },
];

function getArray(data: unknown): Product[] {
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

function numberValue(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const englishDigits = value
    .replace(/[০-৯]/g, (digit) =>
      String("০১২৩৪৫৬৭৮৯".indexOf(digit))
    )
    .replace(/[^\d.-]/g, "");

  return Number(englishDigits) || 0;
}

function formatPrice(value: unknown): string {
  const amount = numberValue(value);

  return amount.toLocaleString("bn-BD", {
    maximumFractionDigits: 2,
  });
}

function productName(product: Product): string {
  return (
    product.nameBn ||
    product.nameBnAlt ||
    product.name ||
    String(product.title || product.name_en || "নাম পাওয়া যায়নি")
  );
}

function productPrice(product: Product): number {
  return numberValue(
    product.today ??
      product.currentPrice ??
      product.price ??
      product.todayPrice ??
      0
  );
}

function productEmoji(product: Product): string {
  if (product.emoji) return product.emoji;

  const category = String(product.category || "").toLowerCase();

  if (category.includes("chal") || category.includes("rice")) return "🍚";
  if (category.includes("dal") || category.includes("lentil")) return "🫘";
  if (category.includes("tel") || category.includes("oil")) return "🫗";
  if (category.includes("sobji") || category.includes("vegetable")) return "🥬";
  if (category.includes("mach") || category.includes("fish")) return "🐟";
  if (category.includes("mangsho") || category.includes("meat")) return "🍗";
  if (category.includes("dim") || category.includes("egg")) return "🥚";

  return "🛒";
}

function productChange(product: Product) {
  const change = product.change;
  const today = productPrice(product);
  const yesterday = numberValue(product.yesterday);

  let pct = numberValue(
    change?.pct ?? change?.percentage ?? product.changePercentage ?? 0
  );

  let direction = String(change?.dir ?? change?.direction ?? "").toLowerCase();

  if (!direction && today && yesterday) {
    direction = today > yesterday ? "up" : today < yesterday ? "down" : "same";
    pct = ((today - yesterday) / yesterday) * 100;
  }

  if (["up", "increase", "increased", "rise", "rising"].includes(direction)) {
    return { direction: "up", pct: Math.abs(pct) };
  }

  if (
    ["down", "decrease", "decreased", "fall", "falling"].includes(direction)
  ) {
    return { direction: "down", pct: Math.abs(pct) };
  }

  if (pct > 0) return { direction: "up", pct };
  if (pct < 0) return { direction: "down", pct: Math.abs(pct) };

  return { direction: "same", pct: 0 };
}

function matchesCategory(product: Product, category: string): boolean {
  if (category === "all") return true;

  const value = String(product.category || "").toLowerCase();
  const categoryName = String(product.categoryNameBn || "").toLowerCase();

  const aliases: Record<string, string[]> = {
    chal: ["chal", "rice", "চাল"],
    dal: ["dal", "lentil", "ডাল"],
    tel: ["tel", "oil", "তেল"],
    sobji: ["sobji", "vegetable", "সবজি", "সব্জি"],
    mach: ["mach", "fish", "মাছ"],
    mangsho: ["mangsho", "meat", "chicken", "মাংস"],
    dim: ["dim", "egg", "ডিম"],
  };

  return (aliases[category] || [category]).some(
    (alias) => value.includes(alias) || categoryName.includes(alias)
  );
}

function ProductCard({ product }: { product: Product }) {
  const change = productChange(product);
  const identifier = product.slug || product.id;
  const categoryLabel =
    product.categoryNameBn ||
    categories.find((item) => item.id === product.category)?.label ||
    "নিত্যপ্রয়োজনীয় পণ্য";

  return (
    <Link
      href={`/product/${encodeURIComponent(String(identifier))}`}
      className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-3xl">
          {productEmoji(product)}
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            change.direction === "up"
              ? "bg-red-50 text-red-600"
              : change.direction === "down"
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          {change.direction === "up"
            ? "▲ "
            : change.direction === "down"
              ? "▼ "
              : ""}
          {change.pct ? `${formatPrice(change.pct)}%` : "পরিবর্তন নেই"}
        </span>
      </div>

      <p className="mt-4 text-xs text-gray-500">{categoryLabel}</p>
      <h3 className="mt-1 min-h-12 font-bold text-gray-900 group-hover:text-green-700">
        {productName(product)}
      </h3>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-gray-500">আজকের দাম</p>
          <p className="mt-1 text-xl font-extrabold text-green-800">
            ৳{formatPrice(productPrice(product))}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            প্রতি {String(product.unit || "একক")}
          </p>
        </div>

        <span className="text-sm font-semibold text-green-700">
          বিস্তারিত →
        </span>
      </div>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border bg-white p-5">
      <div className="h-14 w-14 rounded-xl bg-gray-200" />
      <div className="mt-5 h-3 w-1/3 rounded bg-gray-200" />
      <div className="mt-3 h-5 w-3/4 rounded bg-gray-200" />
      <div className="mt-5 h-7 w-1/2 rounded bg-gray-200" />
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [banglaDate, setBanglaDate] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBanglaDate(
        new Date().toLocaleDateString("bn-BD", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError("");

      let lastError = "পণ্যের তথ্য পাওয়া যায়নি।";

      for (const url of API_URLS) {
        try {
          const response = await fetch(url, { cache: "no-store" });

          if (!response.ok) {
            lastError = `API error: ${response.status}`;
            continue;
          }

          const data: unknown = await response.json();
          const list = getArray(data);

          if (list.length > 0) {
            if (!cancelled) {
              setProducts(list);
              setLoading(false);
              setError("");
            }
            return;
          }

          lastError =
            "API থেকে পণ্যের তালিকা পাওয়া যায়নি। API response format পরীক্ষা করতে হবে।";
        } catch {
          lastError =
            "পণ্যের তথ্য লোড করা যায়নি। ইন্টারনেট বা API সংযোগ পরীক্ষা করুন।";
        }
      }

      if (!cancelled) {
        setProducts([]);
        setError(lastError);
        setLoading(false);
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matches = matchesCategory(product, activeCategory);
      const term = search.trim().toLowerCase();

      const matchesSearch =
        !term ||
        productName(product).toLowerCase().includes(term) ||
        String(product.categoryNameBn || "")
          .toLowerCase()
          .includes(term) ||
        String(product.category || "").toLowerCase().includes(term);

      return matches && matchesSearch;
    });
  }, [products, activeCategory, search]);

  const risers = useMemo(
    () =>
      [...products]
        .filter((product) => productChange(product).direction === "up")
        .sort((a, b) => productChange(b).pct - productChange(a).pct)
        .slice(0, 6),
    [products]
  );

  const fallers = useMemo(
    () =>
      [...products]
        .filter((product) => productChange(product).direction === "down")
        .sort((a, b) => productChange(b).pct - productChange(a).pct)
        .slice(0, 6),
    [products]
  );

  return (
    <main className="min-h-screen bg-[#f7faf7]">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-2xl font-extrabold text-green-800">
            🛒 বাজার দর
            <span className="mt-1 block text-xs font-normal text-gray-500">
              {banglaDate || "আজকের বাজারদর"}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="rounded-xl border border-green-700 px-4 py-2 text-sm font-bold text-green-800 hover:bg-green-50"
            >
              সাইন ইন
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
            >
              সাইন আপ
            </Link>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-4 sm:px-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                document
                  .getElementById("সব-পণ্য")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory === category.id
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-green-50"
              }`}
            >
              {category.emoji} {category.label}
            </button>
          ))}
        </nav>
      </header>

      {products.length > 0 && (
        <div className="overflow-hidden border-b border-green-100 bg-green-50 py-3">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-2 px-4 text-sm text-gray-700">
            {products.slice(0, 8).map((product) => {
              const change = productChange(product);

              return (
                <span key={product.id} className="whitespace-nowrap">
                  {productEmoji(product)} {productName(product)}:{" "}
                  <strong>৳{formatPrice(productPrice(product))}</strong>{" "}
                  <span
                    className={
                      change.direction === "up"
                        ? "text-red-600"
                        : change.direction === "down"
                          ? "text-green-700"
                          : "text-gray-500"
                    }
                  >
                    {change.direction === "up"
                      ? "▲"
                      : change.direction === "down"
                        ? "▼"
                        : "•"}{" "}
                    {change.pct ? `${formatPrice(change.pct)}%` : ""}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
        <div>
          <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800">
            🌿 প্রতিদিনের বাজার, এবার হাতের মুঠোয়
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
            নিত্যপণ্যের
            <span className="block text-green-700">দাম জানুন সহজেই</span>
          </h1>

          <p className="mt-5 max-w-xl leading-7 text-gray-600">
            চাল, ডাল, তেল, মাছ, মাংস ও অন্যান্য প্রয়োজনীয় পণ্যের দাম এক
            জায়গায় দেখুন। বাজারে যাওয়ার আগে জেনে নিন আজকের দাম।
          </p>

          <a
            href="#সব-পণ্য"
            className="mt-7 inline-flex rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
          >
            সব পণ্য দেখুন ↓
          </a>
        </div>

        <div className="flex min-h-64 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 via-emerald-50 to-yellow-50 p-8">
          <div className="grid grid-cols-3 gap-4 text-5xl sm:text-6xl">
            <span>🍚</span>
            <span>🥬</span>
            <span>🐟</span>
            <span>🫘</span>
            <span>🛒</span>
            <span>🥚</span>
          </div>
        </div>
      </section>

      {error && (
        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <h2 className="font-bold">পণ্যের তথ্য লোড হয়নি</h2>
            <p className="mt-2 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </section>
      )}

      {risers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-gray-900">
              📈 আজ দাম বেড়েছে
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              যেসব পণ্যের দাম বেড়েছে
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {risers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {fallers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-gray-900">
              📉 আজ দাম কমেছে
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              যেসব পণ্যের দাম কমেছে
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fallers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section
        id="সব-পণ্য"
        className="mx-auto max-w-7xl scroll-mt-6 px-4 py-10 sm:px-6"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              🛍️ সব পণ্য
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              আপনার প্রয়োজনীয় পণ্য খুঁজে নিন
            </p>
          </div>

          <label className="w-full sm:max-w-sm">
            <span className="sr-only">পণ্য খুঁজুন</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="🔍 পণ্যের নাম লিখুন..."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </label>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                activeCategory === category.id
                  ? "bg-green-700 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-green-50"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
            <div className="text-4xl">🧺</div>
            <h3 className="mt-3 text-lg font-bold text-gray-800">
              {error ? "পণ্য দেখানো যাচ্ছে না" : "কোনো পণ্য পাওয়া যায়নি"}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {error
                ? "উপরের ত্রুটির বার্তাটি দেখুন।"
                : "অন্য নাম দিয়ে খুঁজুন অথবা অন্য ক্যাটাগরি বেছে নিন।"}
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
              className="mt-4 rounded-lg bg-green-700 px-4 py-2 font-bold text-white"
            >
              সব পণ্য দেখুন
            </button>
          </div>
        )}
      </section>

      <footer className="mt-8 bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p className="text-lg font-extrabold">🛒 বাজার দর</p>
          <p className="mt-2 text-sm text-gray-300">
            বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।
          </p>
          <p className="mt-2 text-xs leading-6 text-gray-400">
            সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
          </p>
          <p className="mt-5 text-xs text-gray-500">
            © ২০২৬ বাজার দর
          </p>
        </div>
      </footer>
    </main>
  );
}