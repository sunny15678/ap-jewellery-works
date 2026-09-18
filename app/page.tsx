"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Jewellery = {
  id: number | string;
  name: string;
  category: string;
  description: string | null;
  purity: string | null;
  weight: string | null;
  image_url: string | null;
  created_at: string;
};

type GoldRate = {
  id: number | string;
  rate_22k: number;
  rate_24k: number;
  updated_at: string;
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
  const [jewellery, setJewellery] = useState<Jewellery[]>([]);
  const [goldRate, setGoldRate] = useState<GoldRate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // PHOTO VIEWER
  const [selectedPhoto, setSelectedPhoto] =
    useState<Jewellery | null>(null);

  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  // Prevent website scrolling while photo viewer is open
  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPhoto]);

  async function loadData() {
    setLoading(true);

    const jewelleryResult = await supabase
      .from("jewellery")
      .select(
        "id, name, category, description, purity, weight, image_url, created_at"
      )
      .order("created_at", { ascending: false });

    if (jewelleryResult.error) {
      console.error(
        "Jewellery load error:",
        jewelleryResult.error
      );
    } else {
      setJewellery(jewelleryResult.data || []);
    }

    const goldResult = await supabase
      .from("gold_rates")
      .select("id, rate_22k, rate_24k, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1);

    if (goldResult.error) {
      console.error(
        "Gold rate load error:",
        goldResult.error
      );
    } else {
      setGoldRate(goldResult.data?.[0] || null);
    }

    setLoading(false);
  }

  const filteredJewellery = useMemo(() => {
    return jewellery.filter((item) => {
      const categoryMatch =
        selectedCategory === "All" ||
        item.category?.toLowerCase() ===
          selectedCategory.toLowerCase();

      const searchMatch =
        item.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.category
          .toLowerCase()
          .includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [jewellery, selectedCategory, search]);

  function formatRate(
    value: number | null | undefined
  ) {
    if (value === null || value === undefined) {
      return "₹0";
    }

    return `₹${Number(value).toLocaleString("en-IN")}`;
  }

  function openPhoto(item: Jewellery) {
    if (!item.image_url) return;

    setSelectedPhoto(item);
    setZoom(1);
  }

  function closePhoto() {
    setSelectedPhoto(null);
    setZoom(1);
  }

  function nextPhoto() {
    if (!selectedPhoto) return;

    const currentIndex = filteredJewellery.findIndex(
      (item) => item.id === selectedPhoto.id
    );

    const nextIndex =
      (currentIndex + 1) %
      filteredJewellery.length;

    const nextItem = filteredJewellery[nextIndex];

    if (nextItem?.image_url) {
      setSelectedPhoto(nextItem);
      setZoom(1);
    }
  }

  function previousPhoto() {
    if (!selectedPhoto) return;

    const currentIndex = filteredJewellery.findIndex(
      (item) => item.id === selectedPhoto.id
    );

    const previousIndex =
      (currentIndex - 1 + filteredJewellery.length) %
      filteredJewellery.length;

    const previousItem =
      filteredJewellery[previousIndex];

    if (previousItem?.image_url) {
      setSelectedPhoto(previousItem);
      setZoom(1);
    }
  }

  function whatsappEnquiry(item: Jewellery) {
    const message =
      `Hello AP Jewellery Works, I am interested in ${item.name}. ` +
      `Please share more details.`;

    const url =
      `https://wa.me/919908302023?text=` +
      encodeURIComponent(message);

    window.open(url, "_blank");
  }

  async function shareProduct(item: Jewellery) {
    const shareData = {
      title: item.name,
      text:
        `Check this jewellery from AP Jewellery Works: ` +
        item.name,
      url: item.image_url || window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          item.image_url || window.location.href
        );

        alert("Link copied!");
      }
    } catch {
      // User cancelled sharing
    }
  }

  async function downloadPhoto(item: Jewellery) {
    if (!item.image_url) return;

    try {
      const response = await fetch(item.image_url);

      if (!response.ok) {
        throw new Error("Image could not be downloaded");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;

      const safeName = item.name
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase();

      link.download = `${safeName}.jpg`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);

      // Fallback
      window.open(item.image_url, "_blank");
    }
  }

  // Keyboard controls
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedPhoto) return;

      if (e.key === "Escape") {
        closePhoto();
      }

      if (e.key === "ArrowRight") {
        nextPhoto();
      }

      if (e.key === "ArrowLeft") {
        previousPhoto();
      }

      if (e.key === "+") {
        setZoom((value) =>
          Math.min(value + 0.25, 3)
        );
      }

      if (e.key === "-") {
        setZoom((value) =>
          Math.max(value - 0.25, 1)
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  });

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-yellow-500/20 bg-black/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500">

              <span className="font-serif text-lg font-bold text-yellow-400">
                AP
              </span>

            </div>

            <div>

              <h1 className="font-serif text-lg font-bold tracking-widest text-yellow-400">
                AP JEWELLERY
              </h1>

              <p className="text-[10px] tracking-[0.3em] text-zinc-500">
                WORKS
              </p>

            </div>

          </Link>

          <div className="flex items-center gap-3">

            <a
              href="#collection"
              className="hidden rounded-full border border-yellow-500/40 px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-500 hover:text-black sm:block"
            >
              Collection
            </a>

            <Link
              href="/admin/login"
              className="rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
            >
              Admin
            </Link>

          </div>

        </div>

      </header>


      {/* HERO */}
      <section className="relative overflow-hidden border-b border-yellow-500/10">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.18),transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-5 py-24 text-center md:py-32">

          <p className="mb-5 text-sm tracking-[0.45em] text-yellow-400">
            AP JEWELLERY WORKS
          </p>

          <h2 className="font-serif text-5xl font-bold leading-tight md:text-7xl">
            Timeless Jewellery
            <br />

            <span className="text-yellow-400">
              Crafted With Trust
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
            Discover beautifully crafted gold jewellery
            from AP Jewellery Works, Bhimavaram.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <a
              href="#collection"
              className="rounded-full bg-yellow-500 px-7 py-3 font-semibold text-black hover:bg-yellow-400"
            >
              Explore Collection
            </a>

            <a
              href="https://wa.me/919908302023"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-yellow-500 px-7 py-3 font-semibold text-yellow-400 hover:bg-yellow-500 hover:text-black"
            >
              WhatsApp Us
            </a>

          </div>

        </div>

      </section>


      {/* GOLD RATE */}
      <section className="mx-auto max-w-7xl px-5 py-12">

        <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6 md:p-8">

          <div className="mb-7">

            <p className="text-sm tracking-[0.3em] text-yellow-400">
              TODAY'S GOLD RATE
            </p>

            <h2 className="mt-2 font-serif text-3xl font-bold">
              Current Gold Prices
            </h2>

          </div>

          <div className="grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl border border-yellow-500/20 bg-black p-6">

              <p className="text-sm text-zinc-500">
                22K Gold / 8g
              </p>

              <p className="mt-2 text-4xl font-bold text-yellow-400">
                {formatRate(
                  goldRate?.rate_22k
                )}
              </p>

            </div>

            <div className="rounded-2xl border border-yellow-500/20 bg-black p-6">

              <p className="text-sm text-zinc-500">
                24K Gold / 8g
              </p>

              <p className="mt-2 text-4xl font-bold text-yellow-400">
                {formatRate(
                  goldRate?.rate_24k
                )}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* COLLECTION */}
      <section
        id="collection"
        className="mx-auto max-w-7xl px-5 py-16"
      >

        <div className="mb-10 text-center">

          <p className="text-sm tracking-[0.35em] text-yellow-400">
            OUR COLLECTION
          </p>

          <h2 className="mt-3 font-serif text-4xl font-bold md:text-5xl">
            Jewellery Collection
          </h2>

        </div>


        {/* SEARCH */}
        <div className="mb-6">

          <input
            type="text"
            placeholder="Search jewellery..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-full border border-yellow-500/20 bg-zinc-950 px-5 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-yellow-500 md:max-w-md"
          />

        </div>


        {/* CATEGORIES */}
        <div className="mb-10 flex gap-2 overflow-x-auto pb-2">

          {categories.map((category) => (

            <button
              key={category}
              onClick={() =>
                setSelectedCategory(category)
              }
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm transition ${
                selectedCategory === category
                  ? "bg-yellow-500 font-semibold text-black"
                  : "border border-yellow-500/20 bg-zinc-950 text-zinc-400 hover:border-yellow-500 hover:text-yellow-400"
              }`}
            >
              {category}
            </button>

          ))}

        </div>


        {/* LOADING */}
        {loading && (

          <div className="py-20 text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />

            <p className="mt-4 text-zinc-500">
              Loading jewellery...
            </p>

          </div>

        )}


        {/* NO PRODUCTS */}
        {!loading &&
          filteredJewellery.length === 0 && (

            <div className="rounded-3xl border border-yellow-500/10 bg-zinc-950 py-20 text-center">

              <div className="text-7xl">
                💍
              </div>

              <p className="mt-5 text-zinc-400">
                No jewellery available.
              </p>

            </div>

          )}


        {/* PHOTO GRID */}
        {!loading &&
          filteredJewellery.length > 0 && (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {filteredJewellery.map((item) => (

                <article
                  key={item.id}
                  className="group overflow-hidden rounded-3xl border border-yellow-500/10 bg-zinc-950 transition duration-500 hover:-translate-y-2 hover:border-yellow-500/40"
                >

                  {/* CLICKABLE PHOTO */}
                  <button
                    type="button"
                    onClick={() =>
                      openPhoto(item)
                    }
                    className="relative block aspect-square w-full cursor-zoom-in overflow-hidden bg-zinc-900 text-left"
                  >

                    {item.image_url ? (

                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center">
                        <span className="text-7xl">
                          💍
                        </span>
                      </div>

                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-12">

                      <span className="text-xs text-yellow-400">
                        TAP TO VIEW
                      </span>

                    </div>

                    <div className="absolute left-4 top-4 rounded-full bg-black/80 px-3 py-1 text-xs text-yellow-400 backdrop-blur">
                      {item.category}
                    </div>

                  </button>


                  {/* DETAILS */}
                  <div className="p-5">

                    <h3 className="font-serif text-xl font-semibold">
                      {item.name}
                    </h3>

                    {item.description && (

                      <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                        {item.description}
                      </p>

                    )}

                    <div className="mt-4 space-y-1 text-sm">

                      {item.purity && (

                        <p className="text-zinc-500">
                          Purity:
                          <span className="ml-2 text-white">
                            {item.purity}
                          </span>
                        </p>

                      )}

                      {item.weight && (

                        <p className="text-zinc-500">
                          Weight:
                          <span className="ml-2 text-white">
                            {item.weight}
                          </span>
                        </p>

                      )}

                    </div>


                    <div className="mt-5 grid grid-cols-2 gap-2">

                      <button
                        onClick={() =>
                          whatsappEnquiry(item)
                        }
                        className="rounded-xl bg-yellow-500 px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
                      >
                        WhatsApp
                      </button>

                      <button
                        onClick={() =>
                          shareProduct(item)
                        }
                        className="rounded-xl border border-yellow-500/30 px-3 py-2 text-sm text-yellow-400 hover:bg-yellow-500 hover:text-black"
                      >
                        Share
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

      </section>


      {/* CONTACT */}
      <section
        id="contact"
        className="border-t border-yellow-500/10 bg-zinc-950"
      >

        <div className="mx-auto max-w-7xl px-5 py-16">

          <div className="grid gap-10 md:grid-cols-2">

            <div>

              <p className="text-sm tracking-[0.3em] text-yellow-400">
                VISIT US
              </p>

              <h2 className="mt-3 font-serif text-4xl font-bold">
                AP Jewellery Works
              </h2>

              <p className="mt-5 leading-7 text-zinc-400">
                Prakasham Chowk,
                <br />
                Kalki Bazar,
                <br />
                Bhimavaram
              </p>

            </div>

            <div className="rounded-3xl border border-yellow-500/10 bg-black p-7">

              <p className="text-sm text-zinc-500">
                Owner
              </p>

              <p className="mt-1 text-xl font-semibold">
                Appalacharyulu
              </p>

              <div className="mt-6 space-y-3">

                <a
                  href="tel:+919908302023"
                  className="block rounded-xl border border-yellow-500/20 px-4 py-3 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                >
                  📞 Call: 9908302023
                </a>

                <a
                  href="https://wa.me/919908302023"
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-yellow-500/20 px-4 py-3 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                >
                  💬 WhatsApp
                </a>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-yellow-500/10 px-5 py-8 text-center">

        <p className="font-serif text-yellow-400">
          AP JEWELLERY WORKS
        </p>

        <p className="mt-2 text-xs text-zinc-600">
          ┬⌐ {new Date().getFullYear()} AP Jewellery Works.
          All rights reserved.
        </p>

      </footer>


      {/* ========================================= */}
      {/* FULL SCREEN PHOTO VIEWER */}
      {/* ========================================= */}

      {selectedPhoto &&
        selectedPhoto.image_url && (

          <div
            className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closePhoto();
              }
            }}
          >

            {/* TOP BAR */}
            <div className="flex items-center justify-between border-b border-yellow-500/20 bg-black/80 px-4 py-4">

              <div>

                <h2 className="font-serif text-lg font-semibold text-white">
                  {selectedPhoto.name}
                </h2>

                <p className="text-xs text-yellow-400">
                  {selectedPhoto.category}
                </p>

              </div>

              {/* CLOSE */}
              <button
                onClick={closePhoto}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-500/30 text-2xl text-yellow-400 hover:bg-yellow-500 hover:text-black"
                aria-label="Close"
              >
                Γ£ò
              </button>

            </div>


            {/* IMAGE AREA */}
            <div className="relative flex flex-1 items-center justify-center overflow-hidden px-14 py-6">

              {/* PREVIOUS */}
              {filteredJewellery.length > 1 && (

                <button
                  onClick={previousPhoto}
                  className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/30 bg-black/70 text-3xl text-yellow-400 hover:bg-yellow-500 hover:text-black"
                  aria-label="Previous photo"
                >
                  ΓÇ╣
                </button>

              )}


              {/* IMAGE */}
              <div className="flex h-full w-full items-center justify-center overflow-auto">

                <img
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.name}
                  className="max-h-full max-w-full select-none object-contain transition-transform duration-300"
                  style={{
                    transform: `scale(${zoom})`,
                    cursor:
                      zoom > 1
                        ? "zoom-out"
                        : "zoom-in",
                  }}
                  onClick={() => {
                    setZoom((value) =>
                      value >= 3
                        ? 1
                        : value + 0.5
                    );
                  }}
                />

              </div>


              {/* NEXT */}
              {filteredJewellery.length > 1 && (

                <button
                  onClick={nextPhoto}
                  className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/30 bg-black/70 text-3xl text-yellow-400 hover:bg-yellow-500 hover:text-black"
                  aria-label="Next photo"
                >
                  ΓÇ║
                </button>

              )}

            </div>


            {/* BOTTOM CONTROLS */}
            <div className="border-t border-yellow-500/20 bg-black/90 px-4 py-4">

              <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2">

                {/* ZOOM OUT */}
                <button
                  onClick={() =>
                    setZoom((value) =>
                      Math.max(
                        1,
                        value - 0.25
                      )
                    )
                  }
                  className="rounded-xl border border-yellow-500/30 px-4 py-2 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                >
                  ΓêÆ
                </button>


                {/* ZOOM LEVEL */}
                <div className="min-w-[70px] rounded-xl border border-yellow-500/20 px-4 py-2 text-center text-sm text-zinc-400">
                  {Math.round(zoom * 100)}%
                </div>


                {/* ZOOM IN */}
                <button
                  onClick={() =>
                    setZoom((value) =>
                      Math.min(
                        3,
                        value + 0.25
                      )
                    )
                  }
                  className="rounded-xl border border-yellow-500/30 px-4 py-2 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                >
                  +
                </button>


                {/* SHARE */}
                <button
                  onClick={() =>
                    shareProduct(
                      selectedPhoto
                    )
                  }
                  className="rounded-xl border border-yellow-500/30 px-4 py-2 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                >
                  🔗 Share
                </button>


                {/* DOWNLOAD */}
                <button
                  onClick={() =>
                    downloadPhoto(
                      selectedPhoto
                    )
                  }
                  className="rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400"
                >
                  Γ¼ç∩╕Å Download
                </button>


                {/* WHATSAPP */}
                <button
                  onClick={() =>
                    whatsappEnquiry(
                      selectedPhoto
                    )
                  }
                  className="rounded-xl border border-yellow-500/30 px-4 py-2 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                >
                  💬 WhatsApp
                </button>

              </div>

              <p className="mt-3 text-center text-xs text-zinc-600">
                Click image to zoom ΓÇó Use ΓåÉ ΓåÆ for
                photos ΓÇó ESC to close
              </p>

            </div>

          </div>

        )}

    </main>
  );
}


