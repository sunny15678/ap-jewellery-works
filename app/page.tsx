"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Jewellery = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  purity: string | null;
  weight: number | null;
  image_url: string | null;
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJewellery();
  }, []);

  async function loadJewellery() {
    setLoading(true);

    const { data, error } = await supabase
      .from("jewellery")
      .select(
        "id, name, category, description, purity, weight, image_url"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Jewellery load error:", error);
      setJewellery([]);
    } else {
      setJewellery(data || []);
    }

    setLoading(false);
  }

  const filteredJewellery =
    selectedCategory === "All"
      ? jewellery
      : jewellery.filter(
          (item) => item.category === selectedCategory
        );

  function shareProduct(item: Jewellery) {
    const text = `Check out ${item.name} at AP Jewellery Works`;

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

  function whatsappEnquiry(item: Jewellery) {
    const message = `Hello AP Jewellery Works,

I am interested in this jewellery:

Name: ${item.name}
Category: ${item.category}
${item.purity ? `Purity: ${item.purity}` : ""}
${item.weight ? `Weight: ${item.weight} g` : ""}

Please provide more details.`;

    const url = `https://wa.me/919908302023?text=${encodeURIComponent(
      message
    )}`;

    window.open(url, "_blank");
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-yellow-600/30 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold text-yellow-500">
              AP Jewellery Works
            </h1>

            <p className="text-xs text-gray-500">
              Premium Gold Jewellery
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-lg border border-yellow-600 px-5 py-2 text-sm font-semibold text-yellow-500 transition hover:bg-yellow-500 hover:text-black"
          >
            Admin
          </a>

        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-28 text-center">

        <p className="text-sm uppercase tracking-[0.4em] text-yellow-500">
          AP Jewellery Works
        </p>

        <h2 className="mt-5 text-5xl font-bold md:text-7xl">
          Timeless Gold.
          <br />
          <span className="text-yellow-500">
            Beautifully Crafted.
          </span>
        </h2>

        <p className="mx-auto mt-7 max-w-2xl text-lg text-gray-400">
          Discover beautifully crafted jewellery designed for
          weddings, celebrations and every special moment.
        </p>

        <a
          href="#collection"
          className="mt-9 inline-block rounded-lg bg-yellow-500 px-7 py-3 font-semibold text-black transition hover:bg-yellow-400"
        >
          Explore Collection
        </a>

      </section>

      {/* Jewellery Collection */}
      <section
        id="collection"
        className="border-t border-yellow-600/20 bg-zinc-950 px-6 py-24"
      >

        <div className="mx-auto max-w-7xl">

          {/* Heading */}
          <div className="text-center">

            <p className="text-sm uppercase tracking-[0.4em] text-yellow-500">
              Our Collection
            </p>

            <h3 className="mt-4 text-4xl font-bold md:text-5xl">
              Jewellery Collection
            </h3>

            <p className="mx-auto mt-5 max-w-2xl text-gray-400">
              Explore our latest collection of beautifully crafted
              jewellery.
            </p>

          </div>

          {/* Category filters */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-5 py-2 text-sm transition ${
                  selectedCategory === category
                    ? "border-yellow-500 bg-yellow-500 text-black"
                    : "border-yellow-600/30 text-gray-300 hover:border-yellow-500 hover:text-yellow-500"
                }`}
              >
                {category}
              </button>
            ))}

          </div>

          {/* Products */}
          {loading ? (
            <div className="py-20 text-center text-gray-400">
              Loading jewellery...
            </div>
          ) : filteredJewellery.length === 0 ? (

            <div className="py-20 text-center">

              <div className="text-6xl">
                💍
              </div>

              <h4 className="mt-5 text-2xl font-semibold">
                No Jewellery Available
              </h4>

              <p className="mt-3 text-gray-500">
                New jewellery will appear here when added from
                the Admin panel.
              </p>

            </div>

          ) : (

            <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

              {filteredJewellery.map((item) => (

                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-yellow-600/20 bg-black transition duration-300 hover:-translate-y-1 hover:border-yellow-500/60"
                >

                  {/* Image */}
                  <div className="flex aspect-square items-center justify-center bg-zinc-900">

                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-7xl">
                        💍
                      </div>
                    )}

                  </div>

                  {/* Details */}
                  <div className="p-6">

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <h4 className="text-xl font-semibold text-yellow-500">
                          {item.name}
                        </h4>

                        <p className="mt-1 text-sm text-gray-500">
                          {item.category}
                        </p>
                      </div>

                      {item.purity && (
                        <span className="rounded-full border border-yellow-600/30 px-3 py-1 text-xs text-yellow-500">
                          {item.purity}
                        </span>
                      )}

                    </div>

                    {item.weight && (
                      <p className="mt-4 text-sm text-gray-400">
                        Weight:{" "}
                        <span className="text-white">
                          {item.weight} g
                        </span>
                      </p>
                    )}

                    {item.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                        {item.description}
                      </p>
                    )}

                    {/* Buttons */}
                    <div className="mt-6 grid grid-cols-3 gap-2">

                      {item.image_url && (
                        <a
                          href={item.image_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-yellow-600/30 px-2 py-2 text-center text-xs text-gray-300 transition hover:border-yellow-500 hover:text-yellow-500"
                        >
                          Download
                        </a>
                      )}

                      <button
                        onClick={() => shareProduct(item)}
                        className="rounded-lg border border-yellow-600/30 px-2 py-2 text-xs text-gray-300 transition hover:border-yellow-500 hover:text-yellow-500"
                      >
                        Share
                      </button>

                      <button
                        onClick={() => whatsappEnquiry(item)}
                        className="rounded-lg bg-yellow-500 px-2 py-2 text-xs font-semibold text-black transition hover:bg-yellow-400"
                      >
                        WhatsApp
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

      {/* Contact */}
      <section className="border-t border-yellow-600/20 px-6 py-24 text-center">

        <p className="text-sm uppercase tracking-[0.4em] text-yellow-500">
          Visit Us
        </p>

        <h3 className="mt-4 text-4xl font-bold">
          AP Jewellery Works
        </h3>

        <p className="mx-auto mt-5 max-w-xl text-gray-400">
          Prakasham Chowk, Kalki Bazar, Bhimavaram
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">

          <a
            href="tel:+919908302023"
            className="rounded-lg border border-yellow-600 px-6 py-3 text-yellow-500"
          >
            📞 Call Now
          </a>

          <a
            href="https://wa.me/919908302023"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black"
          >
            💬 WhatsApp
          </a>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-yellow-600/20 px-6 py-8 text-center">

        <p className="font-semibold text-yellow-500">
          AP Jewellery Works
        </p>

        <p className="mt-2 text-sm text-gray-600">
          Prakasham Chowk • Kalki Bazar • Bhimavaram
        </p>

        <p className="mt-4 text-xs text-gray-700">
          © 2026 AP Jewellery Works. All rights reserved.
        </p>

      </footer>

    </main>
  );
}