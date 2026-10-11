import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";

export default function ProductDetailsPage({
params,
}: {
params: Promise<{ id: string }>;
}) {
return (
<Suspense
fallback={ <main className="mx-auto max-w-5xl px-4 py-16 text-center"> <p className="animate-pulse text-lg text-gray-500">
পণ্যের তথ্য লোড হচ্ছে... </p> </main>
}
> <ProductDetailsRoute params={params} /> </Suspense>
);
}

async function ProductDetailsRoute({
params,
}: {
params: Promise<{ id: string }>;
}) {
const { id } = await params;

if (!id?.trim()) {
notFound();
}

return <ProductDetails id={decodeURIComponent(id)} />;
}
