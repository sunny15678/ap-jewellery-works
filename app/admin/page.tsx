"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function AdminDashboard() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [savingRates, setSavingRates] = useState(false);
  const [adding, setAdding] = useState(false);

  const [rate22k, setRate22k] = useState("");
  const [rate24k, setRate24k] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Necklaces");
  const [description, setDescription] = useState("");
  const [purity, setPurity] = useState("22K");
  const [weight, setWeight] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [jewellery, setJewellery] = useState<Jewellery[]>([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    await Promise.all([
      loadGoldRates(),
      loadJewellery(),
    ]);

    setChecking(false);
  }

  async function loadGoldRates() {
    const { data, error } = await supabase
      .from("gold_rates")
      .select("rate_22k, rate_24k")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Gold rate error:", error);
      return;
    }

    if (data) {
      setRate22k(String(data.rate_22k ?? ""));
      setRate24k(String(data.rate_24k ?? ""));
    }
  }

  async function loadJewellery() {
    const { data, error } = await supabase
      .from("jewellery")
      .select(
        "id, name, category, description, purity, weight, image_url"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Jewellery error:", error);
      setError(error.message);
      return;
    }

    setJewellery(data || []);
  }

  async function updateGoldRates(e: FormEvent) {
    e.preventDefault();

    setSavingRates(true);
    setMessage("");
    setError("");

    const { data: existing, error: findError } = await supabase
      .from("gold_rates")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      setError(findError.message);
      setSavingRates(false);
      return;
    }

    let result;

    const values = {
      rate_22k: Number(rate22k),
      rate_24k: Number(rate24k),
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      result = await supabase
        .from("gold_rates")
        .update(values)
        .eq("id", existing.id);
    } else {
      result = await supabase
        .from("gold_rates")
        .insert(values);
    }

    if (result.error) {
      console.error(result.error);
      setError(result.error.message);
    } else {
      setMessage("Gold rates updated successfully.");
    }

    setSavingRates(false);
  }

  async function addJewellery(e: FormEvent) {
    e.preventDefault();

    setAdding(true);
    setMessage("");
    setError("");

    try {
      let imageUrl: string | null = null;

      // Upload image
      if (image) {
        const extension =
          image.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName = `jewellery-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${extension}`;

        const filePath = `jewellery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("jewellery-images")
          .upload(filePath, image);

        if (uploadError) {
          throw new Error(
            `Image upload failed: ${uploadError.message}`
          );
        }

        const { data } = supabase.storage
          .from("jewellery-images")
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      // Save jewellery
      const { error: insertError } = await supabase
        .from("jewellery")
        .insert({
          name,
          category,
          description: description || null,
          purity,
          weight: weight ? Number(weight) : null,
          image_url: imageUrl,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setMessage("Jewellery added successfully.");

      setName("");
      setCategory("Necklaces");
      setDescription("");
      setPurity("22K");
      setWeight("");
      setImage(null);

      const input = document.getElementById(
        "jewellery-image"
      ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }

      await loadJewellery();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    }

    setAdding(false);
  }

  async function deleteJewellery(id: string | number) {
    const confirmed = window.confirm(
      "Delete this jewellery item?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    const { error } = await supabase
      .from("jewellery")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Jewellery deleted.");
    await loadJewellery();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-xl text-yellow-400">
          Checking admin access...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-yellow-700/30 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold text-yellow-400 md:text-2xl">
              AP JEWELLERY WORKS
            </h1>

            <p className="text-sm text-gray-500">
              Admin Dashboard
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="hidden rounded-lg border border-zinc-700 px-4 py-2 text-sm text-gray-300 hover:border-yellow-500 hover:text-yellow-400 sm:block"
            >
              Website
            </Link>

            <button
              onClick={logout}
              className="rounded-lg border border-red-500 px-4 py-2 text-sm text-red-400 hover:bg-red-500 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* MESSAGES */}
        {message && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* GOLD RATES */}
        <section className="mb-10 rounded-2xl border border-yellow-700/30 bg-zinc-950 p-6">
          <h2 className="mb-6 text-2xl font-bold text-yellow-400">
            💰 Gold Rates
          </h2>

          <form
            onSubmit={updateGoldRates}
            className="grid gap-5 md:grid-cols-3"
          >
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                22K Rate / 10g
              </label>

              <input
                type="number"
                value={rate22k}
                onChange={(e) => setRate22k(e.target.value)}
                placeholder="Example: 105000"
                required
                className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                24K Rate / 10g
              </label>

              <input
                type="number"
                value={rate24k}
                onChange={(e) => setRate24k(e.target.value)}
                placeholder="Example: 114000"
                required
                className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={savingRates}
                className="w-full rounded-lg bg-yellow-500 px-5 py-3 font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
              >
                {savingRates
                  ? "Updating..."
                  : "Update Gold Rates"}
              </button>
            </div>
          </form>
        </section>

        {/* ADD JEWELLERY */}
        <section className="mb-10 rounded-2xl border border-yellow-700/30 bg-zinc-950 p-6">
          <h2 className="mb-6 text-2xl font-bold text-yellow-400">
            💎 Add Jewellery
          </h2>

          <form onSubmit={addJewellery} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Jewellery Name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Example: Gold Necklace"
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                >
                  <option>Necklaces</option>
                  <option>Chains</option>
                  <option>Rings</option>
                  <option>Bangles</option>
                  <option>Earrings</option>
                  <option>Bracelets</option>
                  <option>Pendants</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the jewellery..."
                rows={4}
                className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Purity
                </label>

                <select
                  value={purity}
                  onChange={(e) => setPurity(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                >
                  <option>22K</option>
                  <option>24K</option>
                  <option>18K</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Weight (grams)
                </label>

                <input
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Example: 25.50"
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Jewellery Image
              </label>

              <input
                id="jewellery-image"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImage(e.target.files?.[0] || null)
                }
                className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-sm text-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={adding}
              className="rounded-lg bg-yellow-500 px-7 py-3 font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add Jewellery"}
            </button>
          </form>
        </section>

        {/* JEWELLERY LIST */}
        <section className="rounded-2xl border border-yellow-700/30 bg-zinc-950 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-yellow-400">
              📦 Jewellery Collection
            </h2>

            <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-gray-400">
              {jewellery.length} Items
            </span>
          </div>

          {jewellery.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              No jewellery added yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jewellery.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-black"
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
                    <p className="text-xs uppercase text-yellow-500">
                      {item.category}
                    </p>

                    <h3 className="mt-2 text-xl font-bold">
                      {item.name}
                    </h3>

                    <div className="mt-3 text-sm text-gray-400">
                      {item.purity && (
                        <p>Purity: {item.purity}</p>
                      )}

                      {item.weight !== null && (
                        <p>Weight: {item.weight} g</p>
                      )}
                    </div>

                    {item.description && (
                      <p className="mt-3 text-sm text-gray-500">
                        {item.description}
                      </p>
                    )}

                    <button
                      onClick={() =>
                        deleteJewellery(item.id)
                      }
                      className="mt-5 w-full rounded-lg border border-red-500 px-4 py-2 text-red-400 hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}