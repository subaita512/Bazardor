
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[75vh] flex-col items-center justify-center px-5 text-center">
      <div className="text-7xl" aria-hidden="true">
        🛒
      </div>

      <p className="mt-5 text-sm font-bold uppercase tracking-widest text-green-700">
        404 — পৃষ্ঠা পাওয়া যায়নি
      </p>

      <h1 className="mt-3 text-3xl font-extrabold text-gray-900">
        দুঃখিত! পৃষ্ঠাটি খুঁজে পাওয়া যায়নি।
      </h1>

      <p className="mt-3 max-w-md text-gray-600">
        আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি সরানো হয়েছে অথবা ঠিকানাটি ভুল।
      </p>

      <Link
        href="/"
        className="mt-7 rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
      >
        ← হোমপেজে ফিরে যান
      </Link>
    </main>
  );
}