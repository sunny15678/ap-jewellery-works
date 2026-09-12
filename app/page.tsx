"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Jewellery = {
  id: string | number;
  name: string;
  category: string;
  description: string | null;
  purity: string | null;
  weight: number | null;
  image_url: string | null;
};

type GoldRate = {
  rate_22k: number;
  rate_24k: number;
};

const categories = [
  "All",
  "Necklaces",
  "Chains",
  "Rings",
  "Bangles",
  "Earrings",
  "Bracelets",
  "Pendants",
];

export default function Home() {
  const [jewellery, setJewellery] = useState<Jewellery[]>([]);
  const [goldRate, setGoldRate] = useState<GoldRate | null>(null);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: jewelleryData } = await supabase
      .from("jewellery")
      .select(
        "id, name, category, description, purity, weight, image_url"
      )
      .order("created_at", { ascending: false });

    const { data: goldData } = await supabase
      .from("gold_rates")
      .select("rate_22k, rate_24k")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setJewellery(jewelleryData || []);
    setGoldRate(goldData || null);
    setLoading(false);
  }

  const filteredJewellery =
    category === "All"
      ? jewellery
      : jewellery.filter((item) => item.category === category);

  function whatsappEnquiry(item: Jewellery) {
    const message = `Hello AP Jewellery Works,

I am interested in:
${item.name}

Category: ${item.category}
Purity: ${item.purity || "Not specified"}
Weight: ${item.weight ?? "Not specified"} g

Please provide more details.`;

    window.open(
      `https://wa.me/919908302023?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  function shareItem(item: Jewellery) {
    const text = `${item.name} - AP Jewellery Works`;

    if (navigator.share) {
      navigator.share({
        title: item.name,
        text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Website link copied!");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-yellow-700/30 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-wide text-yellow-400 md:text-2xl">
              AP JEWELLERY WORKS
            </h1>
            <p className="text-xs text-gray-400">
              Bhimavaram
            </p>
          </div>

          <Link
            href="/admin/login"
            className="rounded-lg border border-yellow-500 px-5 py-2 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-yellow-900/30">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-yellow-500">
            Premium Gold Jewellery
          </p>

          <h2 className="text-4xl font-bold md:text-6xl">
            AP Jewellery Works
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-gray-400">
            Discover beautiful gold jewellery crafted with elegance,
            tradition and timeless design.
          </p>

          <a
            href="#collection"
            className="mt-8 inline-block rounded-lg bg-yellow-500 px-7 py-3 font-bold text-black transition hover:bg-yellow-400"
          >
            Explore Collection
          </a>
        </div>
      </section>

      {/* GOLD RATES */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-yellow-400">
          Today&apos;s Gold Rates
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-yellow-700/30 bg-zinc-950 p-7 text-center">
            <p className="text-gray-400">22K Gold</p>

            <p className="mt-3 text-3xl font-bold text-yellow-400">
              {goldRate
                ? `₹${goldRate.rate_22k.toLocaleString("en-IN")}`
                : "Not updated"}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Per 10 grams
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-700/30 bg-zinc-950 p-7 text-center">
            <p className="text-gray-400">24K Gold</p>

            <p className="mt-3 text-3xl font-bold text-yellow-400">
              {goldRate
                ? `₹${goldRate.rate_24k.toLocaleString("en-IN")}`
                : "Not updated"}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Per 10 grams
            </p>
          </div>
        </div>
      </section>

      {/* COLLECTION */}
      <section id="collection" className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-widest text-yellow-500">
            Our Collection
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Jewellery Collection
          </h2>
        </div>

        {/* CATEGORIES */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-5 py-2 text-sm transition ${
                category === item
                  ? "bg-yellow-500 text-black"
                  : "border border-zinc-700 text-gray-300 hover:border-yellow-500 hover:text-yellow-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* PRODUCTS */}
        {loading ? (
          <div className="py-20 text-center text-yellow-400">
            Loading jewellery...
          </div>
        ) : filteredJewellery.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 py-20 text-center">
            <p className="text-6xl">💍</p>
            <p className="mt-5 text-gray-400">
              No jewellery available in this category yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJewellery.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition hover:-translate-y-1 hover:border-yellow-600/60"
              >
                <div className="aspect-square bg-zinc-900">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-7xl">
                      💍
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs uppercase tracking-widest text-yellow-500">
                    {item.category}
                  </p>

                  <h3 className="mt-2 text-xl font-bold">
                    {item.name}
                  </h3>

                  {item.description && (
                    <p className="mt-2 text-sm text-gray-400">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-4 space-y-1 text-sm text-gray-300">
                    {item.purity && (
                      <p>Purity: {item.purity}</p>
                    )}

                    {item.weight !== null && (
                      <p>Weight: {item.weight} g</p>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => whatsappEnquiry(item)}
                      className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-bold text-black hover:bg-yellow-400"
                    >
                      WhatsApp
                    </button>

                    <button
                      onClick={() => shareItem(item)}
                      className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-gray-300 hover:border-yellow-500 hover:text-yellow-400"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CONTACT */}
      <section className="border-t border-yellow-900/30 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-yellow-400">
            AP Jewellery Works
          </h2>

          <p className="mt-4 text-gray-400">
            Prakasham Chowk, Kalki Bazar, Bhimavaram
          </p>

          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="tel:9908302023"
              className="rounded-lg border border-yellow-500 px-6 py-3 text-yellow-400 hover:bg-yellow-500 hover:text-black"
            >
              Call: 9908302023
            </a>

            <a
              href="https://wa.me/919908302023"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-yellow-500 px-6 py-3 font-bold text-black hover:bg-yellow-400"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} AP Jewellery Works. All rights reserved.
      </footer>
    </main>
  );
}