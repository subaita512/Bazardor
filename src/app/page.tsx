
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Product = {
  id: string | number;
  name: string;
  category: string;
  unit: string;
  price: number;
  change: number;
  emoji: string;
};

const API_URL =
  "https://api.api-store.workers.dev/api/bazardor/products";

const sampleProducts: Product[] = [
  { id: 1, name: "স্বর্ণমাছি চাল", category: "চাল", unit: "প্রতি কেজি", price: 148, change: 2.6, emoji: "🍚" },
  { id: 2, name: "মিনিকেট চাল", category: "চাল", unit: "প্রতি কেজি", price: 99, change: -2.9, emoji: "🍚" },
  { id: 3, name: "বাসমতি চাল", category: "চাল", unit: "প্রতি কেজি", price: 66, change: 0.6, emoji: "🍚" },
  { id: 4, name: "পেঁয়াজ", category: "সবজি", unit: "প্রতি কেজি", price: 64, change: 5.2, emoji: "🧅" },
  { id: 5, name: "আদা", category: "সবজি", unit: "প্রতি কেজি", price: 85, change: 9.0, emoji: "🫚" },
  { id: 6, name: "বেগুন", category: "সবজি", unit: "প্রতি কেজি", price: 44, change: 4.8, emoji: "🍆" },
  { id: 7, name: "কাঁচামরিচ", category: "সবজি", unit: "প্রতি কেজি", price: 91, change: -4.8, emoji: "🌶️" },
  { id: 8, name: "রসুন", category: "সবজি", unit: "প্রতি কেজি", price: 132, change: -4.8, emoji: "🧄" },
  { id: 9, name: "আলু", category: "সবজি", unit: "প্রতি কেজি", price: 30, change: -3.6, emoji: "🥔" },
  { id: 10, name: "রুই মাছ", category: "মাছ", unit: "প্রতি কেজি", price: 340, change: 4.5, emoji: "🐟" },
  { id: 11, name: "ডিম", category: "ডিম-দুধ", unit: "প্রতি ডজন", price: 158, change: 0.9, emoji: "🥚" },
  { id: 12, name: "সয়াবিন তেল", category: "তেল", unit: "প্রতি লিটার", price: 185, change: 0, emoji: "🫙" },
  { id: 13, name: "মসুর ডাল", category: "ডাল", unit: "প্রতি কেজি", price: 142, change: 2.9, emoji: "🫘" },
  { id: 14, name: "মুরগির মাংস", category: "মাংস", unit: "প্রতি কেজি", price: 225, change: -1.6, emoji: "🍗" },
  { id: 15, name: "ইলিশ মাছ", category: "মাছ", unit: "প্রতি কেজি", price: 850, change: 3.5, emoji: "🐟" },
];

const categories = [
  { name: "চাল", emoji: "🍚", slug: "chal" },
  { name: "ডাল", emoji: "🫘", slug: "dal" },
  { name: "তেল", emoji: "🫙", slug: "tel" },
  { name: "সবজি", emoji: "🥬", slug: "sobji" },
  { name: "মাছ", emoji: "🐟", slug: "mach" },
  { name: "মাংস", emoji: "🍗", slug: "mangsho" },
  { name: "ডিম-দুধ", emoji: "🥛", slug: "dim-dudh" },
  { name: "মসলা", emoji: "🌶️", slug: "moshla" },
];

const bnNumber = (value: number) =>
  new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 1,
  }).format(value);

function readNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(
      value
        .replace(/[০-৯]/g, (digit) =>
          String("০১২৩৪৫৬৭৮৯".indexOf(digit))
        )
        .replace(/,/g, "")
    );

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}


function normalizeProducts(payload: unknown): Product[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  const emojiByCategory: Record<string, string> = {
    chal: "🍚",
    dal: "🫘",
    tel: "🫙",
    sobji: "🥬",
    mach: "🐟",
    mangsho: "🍗",
    dim: "🥚",
    moshla: "🌶️",
  };

  return payload.map((item, index) => {
    const p = item as Record<string, unknown>;

    const changeData =
      p.change && typeof p.change === "object"
        ? (p.change as Record<string, unknown>)
        : {};

    const category = String(
      p.categoryNameBn ?? p.category ?? "অন্যান্য"
    );

    const rawChange = Number(changeData.pct ?? 0);
    const direction = String(changeData.dir ?? "");

    const change =
      direction === "down"
        ? -Math.abs(rawChange)
        : direction === "up"
          ? Math.abs(rawChange)
          : rawChange;

    const rawUnit = String(p.unit ?? "kg");

    const unitLabels: Record<string, string> = {
      kg: "kg",
      litre: "litre",
      liter: "litre",
      piece: "টি",
      dozen: "ডজন",
    };

    return {
      id: String(p.id ?? p.slug ?? index + 1),
      name: String(p.nameBn ?? `পণ্য ${index + 1}`),
      category,
      unit: `প্রতি ${unitLabels[rawUnit.toLowerCase()] ?? rawUnit}`,
      price: readNumber(p.today),
      change,
      emoji:
        typeof p.image === "string"
          ? p.image
          : emojiByCategory[String(p.category ?? "").toLowerCase()] ??
            "🛒",
    };
  });
}
function ChangeBadge({ change }: { change: number }) {
  const isUp = change > 0;
  const isDown = change < 0;

  return (
    <span
      className={`change-badge ${
        isUp
          ? "change-up"
          : isDown
            ? "change-down"
            : "change-flat"
      }`}
    >
      {isUp ? "▲" : isDown ? "▼" : "—"}{" "}
      {bnNumber(Math.abs(change))}%
    </span>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${encodeURIComponent(String(product.id))}`}
      className="product-card"
      aria-label={`${product.name}, ${bnNumber(product.price)} টাকা`}
    >
      <div className="product-card-top">
        <span className="product-emoji" aria-hidden="true">
          {product.emoji}
        </span>

        <div className="product-title">
          <h3>{product.name}</h3>
          <p>{product.unit}</p>
        </div>
      </div>

      <div className="product-price-row">
        <div>
          <p className="price-label">আজকের দাম</p>
          <p className="price-value">
            {bnNumber(product.price)} টাকা
          </p>
        </div>

        <ChangeBadge change={product.change} />
      </div>
    </Link>
  );
}

function ProductSection({
  title,
  products,
  subtitle,
  id,
}: {
  title: string;
  products: Product[];
  subtitle?: string;
  id?: string;
}) {
  return (
    <section className="product-section" id={id}>
      <div className="section-heading">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="empty-message">
          এই মুহূর্তে কোনো পণ্য পাওয়া যায়নি।
        </p>
      )}
    </section>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");

  useEffect(() => {
  const updateDate = () => {
    setDate(
      new Intl.DateTimeFormat("bn-BD", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date())
    );
  };

  queueMicrotask(updateDate);
}, []);

  // Fetch products from the API.
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("পণ্যের তথ্য আনা যায়নি");
        }

        const payload: unknown = await response.json();
        console.log("BazarDor API response:", payload);
        const normalized = normalizeProducts(payload);

        if (normalized.length > 0) {
          setProducts(normalized);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("BazarDor API:", error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  const rising = useMemo(
    () =>
      [...products]
        .filter((product) => product.change > 0)
        .sort((a, b) => b.change - a.change)
        .slice(0, 6),
    [products]
  );

  const falling = useMemo(
    () =>
      [...products]
        .filter((product) => product.change < 0)
        .sort((a, b) => a.change - b.change)
        .slice(0, 6),
    [products]
  );

  const tickerProducts = products.slice(0, 12);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-main content-width">
          <Link
            href="/"
            className="brand"
            aria-label="বাজার দর হোম পেজ"
          >
            <span className="brand-icon">🛒</span>

            <span className="brand-copy">
              <strong>বাজার দর</strong>
              <small>{date || "বাংলাদেশের বাজারদর"}</small>
            </span>
          </Link>

          <div className="auth-actions">
            <Link className="signin-link" href="/signin">
              সাইন ইন
            </Link>

            <Link
              className="button button-primary button-small"
              href="/signup"
            >
              সাইন আপ
            </Link>
          </div>
        </div>

        <nav className="category-nav" aria-label="পণ্যের বিভাগ">
          <div className="content-width category-nav-inner">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="category-link"
              >
                <span aria-hidden="true">{category.emoji}</span>{" "}
                {category.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="ticker" aria-label="বাজারদরের পরিবর্তন">
          <div className="ticker-track">
            {[...tickerProducts, ...tickerProducts].map(
              (product, index) => (
                <span
                  className="ticker-item"
                  key={`${product.id}-${index}`}
                >
                  <span aria-hidden="true">{product.emoji}</span>
                  <strong>{product.name}</strong>
                  <span>
                    {bnNumber(product.price)} টাকা/
                    {product.unit.replace("প্রতি ", "")}
                  </span>
                  <ChangeBadge change={product.change} />
                </span>
              )
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="content-width">
          <section className="hero">
            <div className="hero-copy">
              <span className="hero-eyebrow">
                {date || "আজকের বাজারদর"}
              </span>

              <h1>আজকের বাজারের দাম এক নজরে</h1>

              <p>
                চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম —
                বাজারভিত্তিক বিস্তারিত, গড়, সর্বনিম্ন-সর্বোচ্চ এবং
                দামের পরিবর্তন এক জায়গায়।
              </p>

              <a
                className="button button-primary hero-button"
                href="#সব-পণ্য"
              >
                সব পণ্য দেখুন <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="hero-art" aria-hidden="true">
              <div className="hero-sun" />
              <div className="hero-fruits">🍅 🥬 🥕</div>
              <div className="hero-basket">🧺</div>
              <div className="hero-art-caption">
                তাজা বাজার, সঠিক দাম
              </div>
            </div>
          </section>

          {loading && (
            <div className="loading-note" role="status">
              <span className="loading-spinner" />
              বাজারদরের তথ্য লোড হচ্ছে...
            </div>
          )}

          <ProductSection
            title="🔺 আজ দাম বেড়েছে"
            products={rising}
          />

          <ProductSection
            title="🔻 আজ দাম কমেছে"
            products={falling}
          />

          <ProductSection
            id="সব-পণ্য"
            title="🛒 সব পণ্য"
            subtitle="প্রয়োজনীয় পণ্যের আজকের দাম ও পরিবর্তন এক নজরে দেখুন"
            products={products}
          />
        </div>
      </main>

      <footer className="site-footer">
        <div className="content-width footer-inner">
          <p>বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।</p>
          <p>
            সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
          </p>
        </div>
      </footer>
    </div>
  );
}