
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (name.trim().length === 0) {
      setError("আপনার নাম লিখুন।");
      return;
    }

    if (password.length < 8) {
      setError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }

    if (password !== confirmPassword) {
      setError("দুটি পাসওয়ার্ড মিলছে না।");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError(
          result.error.message ||
            "অ্যাকাউন্ট তৈরি করা যায়নি। আবার চেষ্টা করুন।"
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError(
        "সাইন আপ করা যায়নি। Better Auth এবং ডেটাবেস কনফিগারেশন পরীক্ষা করুন।"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setError("");
    setGoogleLoading(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (result.error) {
        setError(
          result.error.message || "Google দিয়ে সাইন আপ করা যায়নি।"
        );
        setGoogleLoading(false);
      }
    } catch {
      setError("Google দিয়ে সাইন আপ করা যায়নি। আবার চেষ্টা করুন।");
      setGoogleLoading(false);
    }
  }

  const isBusy = loading || googleLoading;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <Link
          href="/"
          className="text-sm font-semibold text-green-700 hover:text-green-800"
        >
          ← হোমপেজে ফিরে যান
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          অ্যাকাউন্ট তৈরি করুন
        </h1>

        <p className="mt-2 text-gray-600">
          বাজার দর-এর সঙ্গে যুক্ত হোন এবং বাজারদরের আপডেট দেখুন।
        </p>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isBusy}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-700" />
              Google-এ সংযোগ হচ্ছে...
            </>
          ) : (
            <>
              <svg
                aria-hidden="true"
                viewBox="0 0 48 48"
                className="h-5 w-5"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 3.07 13.22l7.98 6.19C12.94 13.72 18.01 9.5 24 9.5Z"
                  transform="translate(0 4)"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.64 5.93c4.46-4.12 7.14-10.18 7.14-17.58Z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.06 28.59A14.4 14.4 0 0 1 9.3 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.58 10.78l7.48-6.19Z"
                  transform="translate(0 4)"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.91-5.87l-7.64-5.93c-2.13 1.43-4.85 2.28-8.27 2.28-5.99 0-11.06-4.22-12.95-9.91l-7.98 6.19C6.51 43.62 14.62 48 24 48Z"
                  transform="translate(0 -4)"
                />
              </svg>
              Google দিয়ে সাইন আপ করুন
            </>
          )}
        </button>

        <div className="my-6 flex items-center gap-3 text-sm text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          অথবা ইমেইল দিয়ে সাইন আপ করুন
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block font-medium text-gray-800"
            >
              আপনার নাম
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="আপনার নাম লিখুন"
              required
              autoComplete="name"
              disabled={isBusy}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-medium text-gray-800"
            >
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
              disabled={isBusy}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-medium text-gray-800"
            >
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="কমপক্ষে ৮ অক্ষর"
              minLength={8}
              required
              autoComplete="new-password"
              disabled={isBusy}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block font-medium text-gray-800"
            >
              পাসওয়ার্ড নিশ্চিত করুন
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="পাসওয়ার্ড আবার লিখুন"
              required
              autoComplete="new-password"
              disabled={isBusy}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700 disabled:bg-gray-100"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="w-full rounded-lg bg-green-700 px-4 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "সাইন আপ করুন"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          আগে থেকেই অ্যাকাউন্ট আছে?{" "}
          <Link
            href="/signin"
            className="font-semibold text-green-700 hover:underline"
          >
            সাইন ইন করুন
          </Link>
        </p>
      </div>
    </main>
  );
}