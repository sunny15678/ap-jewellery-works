"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <header className="border-b border-yellow-900/40 bg-black px-8 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-[0.3em] text-yellow-400">
              AP
            </h1>

            <p className="text-xs tracking-[0.4em] text-gray-500">
              JEWELLERY WORKS
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-xl border border-yellow-700 px-6 py-3 text-yellow-400"
          >
            Admin
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="min-h-[650px] bg-black px-8 py-24">
        <div className="mx-auto max-w-7xl">

          <p className="uppercase tracking-[0.4em] text-yellow-500">
            AP Jewellery Works
          </p>

          <h2 className="mt-6 text-6xl font-bold md:text-8xl">
            Jewellery
            <span className="block text-yellow-400">
              Beyond Elegance.
            </span>
          </h2>

          <p className="mt-8 max-w-2xl text-xl text-gray-400">
            Discover beautiful gold jewellery crafted with elegance,
            tradition and timeless design.
          </p>

          <div className="mt-10 flex gap-4">

            <a
              href="https://wa.me/919908302023"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-yellow-500 px-7 py-4 font-bold text-black"
            >
              WhatsApp Us
            </a>

            <a
              href="tel:9908302023"
              className="rounded-xl border border-yellow-700 px-7 py-4 font-bold text-yellow-400"
            >
              Call Now
            </a>

          </div>

        </div>
      </section>

      {/* JEWELLERY COLLECTION */}
      <section
        id="collection"
        className="border-t border-yellow-900/40 bg-zinc-950 px-8 py-24"
      >

        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <p className="uppercase tracking-[0.4em] text-yellow-500">
              Our Collection
            </p>

            <h2 className="mt-5 text-5xl font-bold text-white">
              Jewellery Collection
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-gray-500">
              Explore our beautiful collection of gold jewellery.
            </p>

          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">

            {/* RING */}
            <div className="rounded-3xl border border-yellow-900/40 bg-black p-6">

              <div className="flex h-72 items-center justify-center rounded-2xl bg-zinc-900 text-8xl">
                💍
              </div>

              <h3 className="mt-6 text-2xl font-bold text-yellow-400">
                Gold Rings
              </h3>

              <p className="mt-3 text-gray-500">
                Elegant gold rings for every occasion.
              </p>

              <button
                className="mt-6 w-full rounded-xl bg-yellow-500 px-5 py-3 font-bold text-black"
              >
                WhatsApp Enquiry
              </button>

            </div>

            {/* CHAIN */}
            <div className="rounded-3xl border border-yellow-900/40 bg-black p-6">

              <div className="flex h-72 items-center justify-center rounded-2xl bg-zinc-900 text-8xl">
                📿
              </div>

              <h3 className="mt-6 text-2xl font-bold text-yellow-400">
                Gold Chains
              </h3>

              <p className="mt-3 text-gray-500">
                Beautiful traditional and modern gold chains.
              </p>

              <button
                className="mt-6 w-full rounded-xl bg-yellow-500 px-5 py-3 font-bold text-black"
              >
                WhatsApp Enquiry
              </button>

            </div>

            {/* BANGLES */}
            <div className="rounded-3xl border border-yellow-900/40 bg-black p-6">

              <div className="flex h-72 items-center justify-center rounded-2xl bg-zinc-900 text-8xl">
                💎
              </div>

              <h3 className="mt-6 text-2xl font-bold text-yellow-400">
                Gold Bangles
              </h3>

              <p className="mt-3 text-gray-500">
                Premium traditional and modern bangle designs.
              </p>

              <button
                className="mt-6 w-full rounded-xl bg-yellow-500 px-5 py-3 font-bold text-black"
              >
                WhatsApp Enquiry
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* ABOUT */}
      <section className="bg-black px-8 py-24">

        <div className="mx-auto max-w-7xl">

          <p className="uppercase tracking-[0.4em] text-yellow-500">
            About Us
          </p>

          <h2 className="mt-5 text-5xl font-bold">
            AP Jewellery Works
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-400">
            Quality jewellery, trusted service and beautiful designs
            made for every special occasion.
          </p>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-yellow-900/30 bg-black px-8 py-12">

        <div className="mx-auto max-w-7xl">

          <h3 className="text-2xl font-bold text-yellow-400">
            AP Jewellery Works
          </h3>

          <p className="mt-3 text-gray-500">
            Owner: Appalacharyulu
          </p>

          <p className="mt-2 text-gray-500">
            Prakasham Chowk, Kalki Bazar, Bhimavaram
          </p>

          <p className="mt-2 text-gray-500">
            📞 9908302023
          </p>

        </div>

      </footer>

    </main>
  );
}