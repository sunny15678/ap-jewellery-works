"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error(error);
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-yellow-700/40 bg-zinc-950 p-8 shadow-2xl">
        
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500 text-3xl">
            💎
          </div>

          <h1 className="text-3xl font-bold text-yellow-400">
            AP JEWELLERY WORKS
          </h1>

          <p className="mt-2 text-gray-400">
            Administrator Login
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 outline-none focus:border-yellow-500"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-yellow-500 px-5 py-3 font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-gray-500 hover:text-yellow-400"
        >
          ← Back to Website
        </Link>
      </div>
    </main>
  );
}