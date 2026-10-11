
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError(result.error.message || "সাইন ইন করা যায়নি।");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("সাইন ইন করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (result.error) {
        setError(result.error.message || "Google সাইন ইন ব্যর্থ হয়েছে।");
        setLoading(false);
      }
    } catch {
      setError(
        "Google সাইন ইন ব্যর্থ হয়েছে। Google OAuth configuration পরীক্ষা করুন।"
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm font-semibold text-green-700">
          ← হোমপেজে ফিরে যান
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          সাইন ইন করুন
        </h1>
        <p className="mt-2 text-gray-600">
          আপনার বাজার দর অ্যাকাউন্টে প্রবেশ করুন।
        </p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-8 w-full rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          {loading ? "সংযোগ হচ্ছে..." : "G — Google দিয়ে সাইন ইন"}
        </button>

        <div className="my-6 text-center text-sm text-gray-500">
          অথবা ইমেইল দিয়ে সাইন ইন করুন
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block font-medium">
              ইমেইল ঠিকানা
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="আপনার ইমেইল লিখুন"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block font-medium">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="আপনার পাসওয়ার্ড লিখুন"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 px-4 py-3 font-bold text-white hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? "সাইন ইন হচ্ছে..." : "সাইন ইন"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/signup" className="font-semibold text-green-700">
            সাইন আপ করুন
          </Link>
        </p>
      </div>
    </main>
  );
}