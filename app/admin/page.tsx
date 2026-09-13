"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type GoldRate = {
  id: number;
  rate_22k: number;
  rate_24k: number;
  updated_at: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [gold22k, setGold22k] = useState("");
  const [gold24k, setGold24k] = useState("");
  const [currentRate, setCurrentRate] = useState<GoldRate | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

    await loadGoldRate();
    setLoading(false);
  }

  async function loadGoldRate() {
    const { data, error } = await supabase
      .from("gold_rates")
      .select("id, rate_22k, rate_24k, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Load gold rate error:", error);
      setMessage(`❌ ${error.message}`);
      return;
    }

    if (data) {
      setCurrentRate(data);
      setGold22k(String(data.rate_22k));
      setGold24k(String(data.rate_24k));
    }
  }

  async function updateGoldRates() {
    setMessage("");

    const rate22 = Number(gold22k);
    const rate24 = Number(gold24k);

    if (!gold22k || !gold24k) {
      setMessage("❌ Please enter both gold rates.");
      return;
    }

    if (!Number.isFinite(rate22) || !Number.isFinite(rate24)) {
      setMessage("❌ Please enter valid numbers.");
      return;
    }

    if (rate22 <= 0 || rate24 <= 0) {
      setMessage("❌ Gold rates must be greater than 0.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("gold_rates")
      .update({
        rate_22k: rate22,
        rate_24k: rate24,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      console.error("Update gold rate error:", error);
      setMessage(`❌ ${error.message}`);
      setSaving(false);
      return;
    }

    await loadGoldRate();

    setMessage(
      `✅ Gold rates updated: ₹${rate22.toLocaleString(
        "en-IN"
      )} / ₹${rate24.toLocaleString("en-IN")}`
    );

    setSaving(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-yellow-400 text-lg">
          Loading Admin Dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-yellow-500/20 bg-black">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">
              AP Jewellery Works
            </h1>
            <p className="text-sm text-gray-400">
              Admin Dashboard
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500 hover:text-black transition"
            >
              View Website
            </Link>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8">
          Dashboard
        </h2>

        {/* Gold Rate */}
        <div className="max-w-2xl rounded-2xl border border-yellow-500/30 bg-zinc-950 p-8 shadow-xl">
          <h3 className="text-2xl font-bold text-yellow-400">
            Gold Rates
          </h3>

          <p className="text-gray-400 mt-2 mb-8">
            Update the gold rates displayed on your website.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 22K */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                22K Rate / 10g
              </label>

              <input
                type="number"
                value={gold22k}
                onChange={(e) => setGold22k(e.target.value)}
                placeholder="7009"
                className="w-full rounded-xl bg-black border border-yellow-500/30 px-4 py-4 text-xl text-white outline-none focus:border-yellow-400"
              />
            </div>

            {/* 24K */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                24K Rate / 10g
              </label>

              <input
                type="number"
                value={gold24k}
                onChange={(e) => setGold24k(e.target.value)}
                placeholder="7592"
                className="w-full rounded-xl bg-black border border-yellow-500/30 px-4 py-4 text-xl text-white outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          {/* Button */}
          <button
            onClick={updateGoldRates}
            disabled={saving}
            className="mt-8 w-full rounded-xl bg-yellow-500 px-6 py-4 text-lg font-bold text-black hover:bg-yellow-400 disabled:opacity-50 transition"
          >
            {saving ? "Updating..." : "Update Gold Rates"}
          </button>

          {/* Message */}
          {message && (
            <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <p className="text-yellow-300">
                {message}
              </p>
            </div>
          )}

          {/* Current values */}
          {currentRate && (
            <div className="mt-8 border-t border-white/10 pt-6">
              <h4 className="font-semibold mb-4">
                Current Database Values
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-black border border-white/10 p-4">
                  <p className="text-sm text-gray-400">
                    22K
                  </p>

                  <p className="text-2xl font-bold text-yellow-400">
                    ₹
                    {Number(currentRate.rate_22k).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-black border border-white/10 p-4">
                  <p className="text-sm text-gray-400">
                    24K
                  </p>

                  <p className="text-2xl font-bold text-yellow-400">
                    ₹
                    {Number(currentRate.rate_24k).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Last updated:{" "}
                {new Date(
                  currentRate.updated_at
                ).toLocaleString("en-IN")}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}