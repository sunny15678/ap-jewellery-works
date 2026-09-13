"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type GoldRates = {
  rate22k: number;
  rate24k: number;
  updatedAt: string;
};

type Jewellery = {
  id: string | number;
  name: string;
  category: string;
  description: string;
  purity: string;
  weight: number | string | null;
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

export default function HomePage() {
  const [goldRates, setGoldRates] = useState<GoldRates>({
    rate22k: 0,
    rate24k: 0,
    updatedAt: "",
  });

  const [jewellery, setJewellery] = useState<Jewellery[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [search, setSearch] = useState("");
  const [loadingRates, setLoadingRates] = useState(true);
  const [loadingJewellery, setLoadingJewellery] =
    useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  // ---------------------------------------------------------
  // LOAD GOLD RATES
  // ---------------------------------------------------------

  async function loadGoldRates() {
    setLoadingRates(true);

    try {
      const { data, error } = await supabase
        .from("gold_rates")
        .select(
          "id, rate_22k, rate_24k, updated_at"
        )
        .order("updated_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "Gold rate loading error:",
          error
        );

        setErrorMessage(
          "Unable to load latest gold rates."
        );

        return;
      }

      if (!data) {
        console.log(
          "No gold rate record found."
        );

        return;
      }

      console.log(
        "LATEST GOLD RATE FROM SUPABASE:",
        data
      );

      setGoldRates({
        rate22k: Number(data.rate_22k),
        rate24k: Number(data.rate_24k),
        updatedAt: data.updated_at,
      });
    } catch (error) {
      console.error(
        "Unexpected gold rate error:",
        error
      );
    } finally {
      setLoadingRates(false);
    }
  }

  // ---------------------------------------------------------
  // LOAD JEWELLERY
  // ---------------------------------------------------------

  async function loadJewellery() {
    setLoadingJewellery(true);

    try {
      const { data, error } = await supabase
        .from("jewellery")
        .select(
          "id, name, category, description, purity, weight, image_url"
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Jewellery loading error:",
          error
        );

        return;
      }

      setJewellery(
        (data ?? []) as Jewellery[]
      );
    } catch (error) {
      console.error(
        "Unexpected jewellery error:",
        error
      );
    } finally {
      setLoadingJewellery(false);
    }
  }

  // ---------------------------------------------------------
  // INITIAL LOAD
  // ---------------------------------------------------------

  useEffect(() => {
    loadGoldRates();
    loadJewellery();
  }, []);

  // ---------------------------------------------------------
  // FILTER JEWELLERY
  // ---------------------------------------------------------

  const filteredJewellery = useMemo(() => {
    return jewellery.filter((item) => {
      const categoryMatch =
        selectedCategory === "All" ||
        item.category?.toLowerCase() ===
          selectedCategory.toLowerCase();

      const searchMatch =
        search.trim() === "" ||
        item.name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [
    jewellery,
    selectedCategory,
    search,
  ]);

  // ---------------------------------------------------------
  // FORMAT RATE
  // ---------------------------------------------------------

  function formatRate(rate: number) {
    if (!rate || Number.isNaN(rate)) {
      return "₹--";
    }

    return `₹${rate.toLocaleString("en-IN")}`;
  }

  // ---------------------------------------------------------
  // WHATSAPP
  // ---------------------------------------------------------

  function whatsappEnquiry(
    productName: string
  ) {
    const message = encodeURIComponent(
      `Hello AP Jewellery Works, I am interested in ${productName}.`
    );

    window.open(
      `https://wa.me/919908302023?text=${message}`,
      "_blank"
    );
  }

  // ---------------------------------------------------------
  // SHARE
  // ---------------------------------------------------------

  async function shareProduct(
    product: Jewellery
  ) {
    const text = `${product.name} - AP Jewellery Works`;

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.share
      ) {
        await navigator.share({
          title: product.name,
          text,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          window.location.href
        );

        alert(
          "Product link copied!"
        );
      }
    } catch {
      console.log("Share cancelled");
    }
  }

  // ---------------------------------------------------------
  // REFRESH
  // ---------------------------------------------------------

  async function refreshData() {
    await Promise.all([
      loadGoldRates(),
      loadJewellery(),
    ]);
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-yellow-700/30 bg-black/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-500 bg-black text-xl font-bold text-yellow-400">
              AP
            </div>

            <div>
              <div className="font-serif text-lg font-bold tracking-wide text-yellow-400">
                AP JEWELLERY
              </div>

              <div className="text-xs tracking-[0.25em] text-white/50">
                WORKS
              </div>
            </div>
          </Link>

          <Link
            href="/admin/login"
            className="rounded-full border border-yellow-500 px-5 py-2 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
          >
            Admin
          </Link>

        </div>

      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-yellow-700/20">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.14),transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-5 py-24 text-center">

          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full border-2 border-yellow-500 shadow-[0_0_50px_rgba(212,175,55,0.25)]">

            <div className="text-5xl font-serif font-bold text-yellow-400">
              AP
            </div>

          </div>

          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-yellow-500">
            Since Excellence
          </p>

          <h1 className="font-serif text-4xl font-bold md:text-6xl">
            AP Jewellery Works
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-white/60">
            Discover timeless gold jewellery crafted
            with elegance, tradition and perfection.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <a
              href="#collection"
              className="rounded-full bg-yellow-500 px-7 py-3 font-semibold text-black transition hover:bg-yellow-400"
            >
              Explore Collection
            </a>

            <a
              href="tel:9908302023"
              className="rounded-full border border-yellow-500 px-7 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
            >
              Call Now
            </a>

          </div>

        </div>

      </section>

      {/* =====================================================
          GOLD RATES
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-16">

        <div className="mb-8 text-center">

          <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
            Live Market Update
          </p>

          <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">
            Today&apos;s Gold Rates
          </h2>

        </div>

        <div className="grid gap-5 md:grid-cols-2">

          {/* 22K */}

          <div className="rounded-3xl border border-yellow-700/40 bg-gradient-to-br from-yellow-500/10 to-transparent p-8">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm uppercase tracking-widest text-yellow-500">
                  Gold
                </p>

                <h3 className="mt-1 text-3xl font-bold">
                  22K
                </h3>
              </div>

              <div className="text-4xl">
                🪙
              </div>

            </div>

            <div className="mt-8">

              {loadingRates ? (
                <div className="animate-pulse text-4xl font-bold text-white/30">
                  Loading...
                </div>
              ) : (
                <div className="text-4xl font-bold text-yellow-400">
                  {formatRate(
                    goldRates.rate22k
                  )}
                </div>
              )}

              <p className="mt-2 text-sm text-white/40">
                Per 10 grams
              </p>

            </div>

          </div>

          {/* 24K */}

          <div className="rounded-3xl border border-yellow-700/40 bg-gradient-to-br from-yellow-500/10 to-transparent p-8">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm uppercase tracking-widest text-yellow-500">
                  Gold
                </p>

                <h3 className="mt-1 text-3xl font-bold">
                  24K
                </h3>
              </div>

              <div className="text-4xl">
                💎
              </div>

            </div>

            <div className="mt-8">

              {loadingRates ? (
                <div className="animate-pulse text-4xl font-bold text-white/30">
                  Loading...
                </div>
              ) : (
                <div className="text-4xl font-bold text-yellow-400">
                  {formatRate(
                    goldRates.rate24k
                  )}
                </div>
              )}

              <p className="mt-2 text-sm text-white/40">
                Per 10 grams
              </p>

            </div>

          </div>

        </div>

        {/* UPDATED TIME */}

        {goldRates.updatedAt && (
          <div className="mt-5 text-center text-xs text-white/40">
            Last updated:{" "}
            {new Date(
              goldRates.updatedAt
            ).toLocaleString("en-IN")}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 text-center text-sm text-red-400">
            {errorMessage}
          </div>
        )}

        <div className="mt-5 text-center">

          <button
            onClick={refreshData}
            className="rounded-full border border-yellow-700 px-5 py-2 text-sm text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
          >
            ↻ Refresh Rates
          </button>

        </div>

      </section>

      {/* =====================================================
          COLLECTION
      ====================================================== */}

      <section
        id="collection"
        className="border-t border-yellow-700/20 bg-[#070707] px-5 py-16"
      >

        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
              Our Collection
            </p>

            <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">
              Premium Jewellery
            </h2>

          </div>

          {/* SEARCH */}

          <div className="mx-auto mt-10 max-w-xl">

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search jewellery..."
              className="w-full rounded-full border border-yellow-700/40 bg-black px-6 py-4 text-white outline-none placeholder:text-white/30 focus:border-yellow-500"
            />

          </div>

          {/* CATEGORIES */}

          <div className="mt-7 flex gap-3 overflow-x-auto pb-3">

            {categories.map(
              (category) => (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(
                      category
                    )
                  }
                  className={`whitespace-nowrap rounded-full border px-5 py-2 text-sm font-medium transition ${
                    selectedCategory ===
                    category
                      ? "border-yellow-500 bg-yellow-500 text-black"
                      : "border-yellow-700/40 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                  }`}
                >
                  {category}
                </button>
              )
            )}

          </div>

          {/* PRODUCTS */}

          {loadingJewellery ? (

            <div className="py-20 text-center text-white/50">
              Loading jewellery...
            </div>

          ) : filteredJewellery.length ===
            0 ? (

            <div className="py-20 text-center">

              <div className="text-6xl">
                💍
              </div>

              <p className="mt-4 text-white/50">
                No jewellery found.
              </p>

            </div>

          ) : (

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {filteredJewellery.map(
                (product) => (

                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-3xl border border-yellow-700/30 bg-black transition duration-300 hover:-translate-y-1 hover:border-yellow-500 hover:shadow-[0_15px_50px_rgba(212,175,55,0.12)]"
                  >

                    {/* IMAGE */}

                    <div className="relative aspect-square overflow-hidden bg-[#111]">

                      {product.image_url ? (

                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                      ) : (

                        <div className="flex h-full items-center justify-center text-7xl">
                          💍
                        </div>

                      )}

                    </div>

                    {/* DETAILS */}

                    <div className="p-5">

                      <div className="flex items-start justify-between gap-3">

                        <div>

                          <h3 className="font-serif text-xl font-bold text-yellow-400">
                            {product.name}
                          </h3>

                          <p className="mt-1 text-xs uppercase tracking-wider text-white/40">
                            {product.category}
                          </p>

                        </div>

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                        <div className="rounded-xl bg-white/5 p-3">

                          <p className="text-xs text-white/40">
                            Purity
                          </p>

                          <p className="mt-1 font-semibold text-white">
                            {product.purity ||
                              "—"}
                          </p>

                        </div>

                        <div className="rounded-xl bg-white/5 p-3">

                          <p className="text-xs text-white/40">
                            Weight
                          </p>

                          <p className="mt-1 font-semibold text-white">
                            {product.weight
                              ? `${product.weight} g`
                              : "—"}
                          </p>

                        </div>

                      </div>

                      {product.description && (
                        <p className="mt-4 line-clamp-2 text-sm text-white/50">
                          {product.description}
                        </p>
                      )}

                      {/* ACTIONS */}

                      <div className="mt-5 grid grid-cols-2 gap-2">

                        <button
                          onClick={() =>
                            whatsappEnquiry(
                              product.name
                            )
                          }
                          className="rounded-xl bg-yellow-500 px-3 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
                        >
                          WhatsApp
                        </button>

                        <button
                          onClick={() =>
                            shareProduct(
                              product
                            )
                          }
                          className="rounded-xl border border-yellow-700/50 px-3 py-3 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
                        >
                          Share
                        </button>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          CONTACT
      ====================================================== */}

      <section className="border-t border-yellow-700/20 px-5 py-20">

        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
            Visit Us
          </p>

          <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">
            AP Jewellery Works
          </h2>

          <p className="mt-5 text-white/60">
            Prakasham Chowk, Kalki Bazar,
            Bhimavaram
          </p>

          <p className="mt-2 text-xl font-semibold text-yellow-400">
            9908302023
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <a
              href="tel:9908302023"
              className="rounded-full bg-yellow-500 px-7 py-3 font-bold text-black transition hover:bg-yellow-400"
            >
              📞 Call Now
            </a>

            <a
              href="https://wa.me/919908302023"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-yellow-500 px-7 py-3 font-bold text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
            >
              💬 WhatsApp
            </a>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-yellow-700/20 bg-black px-5 py-8 text-center">

        <p className="font-serif text-lg font-bold text-yellow-400">
          AP JEWELLERY WORKS
        </p>

        <p className="mt-2 text-sm text-white/30">
          Luxury • Trust • Tradition
        </p>

        <p className="mt-4 text-xs text-white/20">
          © {new Date().getFullYear()} AP Jewellery Works
        </p>

      </footer>

    </main>
  );
}