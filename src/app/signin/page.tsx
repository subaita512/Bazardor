"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function SignInPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

function handleSubmit(e: FormEvent<HTMLFormElement>) {
e.preventDefault();
alert("Sign-in is not connected to Better Auth yet.");
}

return ( <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12"> <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm"> <Link href="/" className="text-sm font-semibold text-green-700">
← হোমপেজে ফিরে যান </Link>

```
    <h1 className="mt-6 text-3xl font-bold text-gray-900">
      সাইন ইন করুন
    </h1>

    <p className="mt-2 text-gray-600">
      আপনার বাজার দর অ্যাকাউন্টে প্রবেশ করুন।
    </p>

    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
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
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-green-700 px-4 py-3 font-bold text-white"
      >
        সাইন ইন
      </button>
    </form>

    <p className="mt-6 text-center text-sm text-gray-600">
      অ্যাকাউন্ট নেই?{" "}
      <Link href="/signup" className="font-semibold text-green-700">
        সাইন আপ করুন
      </Link>
    </p>
  </div>
</div>

);
}
