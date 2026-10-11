"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const result = await authClient.updateUser({ name });

      if (result.error) {
        setMessage(result.error.message || "প্রোফাইল আপডেট করা যায়নি।");
      } else {
        setMessage("আপনার নাম সফলভাবে আপডেট হয়েছে।");
      }
    } catch {
      setMessage("একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  }

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p>প্রোফাইল লোড হচ্ছে...</p>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-2xl font-bold">সাইন ইন প্রয়োজন</h1>
        <p className="mt-2 text-gray-600">
          প্রোফাইল দেখতে প্রথমে আপনার অ্যাকাউন্টে সাইন ইন করুন।
        </p>
        <Link
          href="/signin"
          className="mt-5 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white"
        >
          সাইন ইন করুন
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7faf7] px-4 py-12">
      <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="font-medium text-green-700">
          ← হোমপেজে ফিরে যান
        </Link>

        <div className="mt-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-3xl">
            👤
          </div>

          <h1 className="mt-4 text-3xl font-bold">আমার প্রোফাইল</h1>
          <p className="mt-2 text-gray-500">
            আপনার অ্যাকাউন্টের তথ্য দেখুন ও আপডেট করুন।
          </p>
        </div>

        <form onSubmit={handleUpdate} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block font-medium">
              আপনার নাম
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={session.user.name || "আপনার নাম লিখুন"}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block font-medium">
              ইমেইল ঠিকানা
            </label>
            <input
              id="email"
              type="email"
              value={session.user.email}
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-600"
            />
            <p className="mt-1 text-xs text-gray-500">
              ইমেইল ঠিকানা এখানে পরিবর্তন করা যাবে না।
            </p>
          </div>

          {message && (
            <p role="status" className="text-sm text-green-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-green-700 px-4 py-3 font-bold text-white hover:bg-green-800 disabled:opacity-60"
          >
            {saving ? "আপডেট হচ্ছে..." : "প্রোফাইল আপডেট করুন"}
          </button>
        </form>
      </div>
    </main>
  );
}