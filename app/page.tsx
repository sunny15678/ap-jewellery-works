"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ManagedJewellery = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  purity?: string | null;
  weight?: string | null;
  image_url?: string | null;
};

type UploadItem = {
  id: string;
  file: File;
  name: string;
  category: string;
  status: "waiting" | "uploading" | "success" | "error";
  error?: string;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Gold rates
  const [rate22k, setRate22k] = useState("");
  const [rate24k, setRate24k] = useState("");
  const [rateLoading, setRateLoading] = useState(false);
  const [rateMessage, setRateMessage] = useState("");

  // Uploads
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = [
    "Necklaces",
    "Chains",
    "Rings",
    "Bangles",
    "Earrings",
    "Bracelets",
    "Pendants",
  ];

  const [bulkCategory, setBulkCategory] = useState("Rings");

  // Manage jewellery
  const [managedJewellery, setManagedJewellery] = useState<ManagedJewellery[]>([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageMessage, setManageMessage] = useState("");
  const [manageSearch, setManageSearch] = useState("");
  const [manageCategory, setManageCategory] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategory, setEditingCategory] = useState("Rings");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      window.location.href = "/admin/login";
      return;
    }

    setAuthorized(true);
    setLoading(false);

    await loadGoldRate();
    await loadManagedJewellery();
  }

  async function loadGoldRate() {
    const { data, error } = await supabase
      .from("gold_rates")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Gold rate load error:", error);
      return;
    }

    if (data) {
      setRate22k(data.rate_22k?.toString() ?? "");
      setRate24k(data.rate_24k?.toString() ?? "");
    }
  }

  async function updateGoldRate() {
    setRateLoading(true);
    setRateMessage("");

    try {
      const value22k = Number(rate22k);
      const value24k = Number(rate24k);

      if (!value22k || !value24k) {
        setRateMessage("Please enter valid gold rates.");
        setRateLoading(false);
        return;
      }

      const { data: latestRate } = await supabase
        .from("gold_rates")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let error;

      if (latestRate?.id) {
        const result = await supabase
          .from("gold_rates")
          .update({
            rate_22k: value22k,
            rate_24k: value24k,
            updated_at: new Date().toISOString(),
          })
          .eq("id", latestRate.id);

        error = result.error;
      } else {
        const result = await supabase.from("gold_rates").insert({
          rate_22k: value22k,
          rate_24k: value24k,
        });

        error = result.error;
      }

      if (error) {
        throw error;
      }

      setRateMessage("Gold rates updated successfully.");
      await loadGoldRate();
    } catch (error) {
      console.error(error);
      setRateMessage("Failed to update gold rates.");
    }

    setRateLoading(false);
  }

  function handleImageSelection(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      setUploadMessage("Please select image files.");
      return;
    }

    const availableSlots = 100 - uploadItems.length;

    if (availableSlots <= 0) {
      setUploadMessage("Maximum 100 images can be selected.");
      return;
    }

    const selectedFiles = imageFiles.slice(0, availableSlots);

    const newItems: UploadItem[] = selectedFiles.map((file, index) => {
      const filename = file.name.replace(/\.[^/.]+$/, "");

      return {
        id: `${Date.now()}-${index}-${Math.random()}`,
        file,
        name: filename,
        category: bulkCategory,
        status: "waiting",
      };
    });

    setUploadItems((previous) => [...previous, ...newItems]);
    setUploadMessage("");

    // Allow selecting the same files again later.
    event.target.value = "";
  }

  function updateImageName(id: string, name: string) {
    setUploadItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              name,
            }
          : item
      )
    );
  }

  function updateImageCategory(id: string, category: string) {
    setUploadItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, category }
          : item
      )
    );
  }

  function applyCategoryToAll() {
    if (uploadItems.length === 0) return;

    setUploadItems((items) =>
      items.map((item) =>
        item.status === "waiting"
          ? { ...item, category: bulkCategory }
          : item
      )
    );

    setUploadMessage(`Category "${bulkCategory}" applied to all waiting images.`);
  }

  function removeImage(id: string) {
    setUploadItems((items) => items.filter((item) => item.id !== id));
  }

  function clearImages() {
    if (uploading) return;

    setUploadItems([]);
    setUploadMessage("");
    setUploadProgress(0);
  }

  async function uploadImages() {
    if (uploadItems.length === 0) {
      setUploadMessage("Please select images first.");
      return;
    }

    const emptyNames = uploadItems.filter(
      (item) => item.name.trim().length === 0
    );

    if (emptyNames.length > 0) {
      setUploadMessage("Please enter a name for every image.");
      return;
    }

    setUploading(true);
    setUploadMessage("");
    setUploadProgress(0);

    let completed = 0;

    for (const item of uploadItems) {
      if (item.status === "success") {
        completed++;
        continue;
      }

      setUploadItems((items) =>
        items.map((current) =>
          current.id === item.id
            ? {
                ...current,
                status: "uploading",
                error: undefined,
              }
            : current
        )
      );

      try {
        const safeOriginalName = item.file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9-_]/g, "-")
          .toLowerCase();

        const extension =
          item.file.name.split(".").pop()?.toLowerCase() || "jpg";

        const uniqueFileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 10)}-${safeOriginalName}.${extension}`;

        const storagePath = `jewellery/${uniqueFileName}`;

        // Upload image to Supabase Storage
        const { error: storageError } = await supabase.storage
          .from("jewellery-images")
          .upload(storagePath, item.file, {
            cacheControl: "3600",
            upsert: false,
            contentType: item.file.type,
          });

        if (storageError) {
          throw storageError;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("jewellery-images")
          .getPublicUrl(storagePath);

        const imageUrl = publicUrlData.publicUrl;

        // Save jewellery record
        const { error: databaseError } = await supabase
          .from("jewellery")
          .insert({
            name: item.name.trim(),
            category: item.category,
            description: null,
            purity: null,
            weight: null,
            image_url: imageUrl,
          });

        if (databaseError) {
          // Remove uploaded image if database insert fails
          await supabase.storage
            .from("jewellery-images")
            .remove([storagePath]);

          throw databaseError;
        }

        setUploadItems((items) =>
          items.map((current) =>
            current.id === item.id
              ? {
                  ...current,
                  status: "success",
                }
              : current
          )
        );
      } catch (error: any) {
        console.error("Upload error:", error);

        setUploadItems((items) =>
          items.map((current) =>
            current.id === item.id
              ? {
                  ...current,
                  status: "error",
                  error: error?.message || "Upload failed",
                }
              : current
          )
        );
      }

      completed++;
      setUploadProgress(
        Math.round((completed / uploadItems.length) * 100)
      );
    }

    setUploading(false);

    const successful = uploadItems.filter(
      (item) => item.status === "success"
    ).length;

    setUploadMessage(
      `Upload process completed. Check the status beside each image.`
    );
  }

  async function loadManagedJewellery() {
    setManageLoading(true);
    setManageMessage("");

    const { data, error } = await supabase
      .from("jewellery")
      .select("id, name, category, description, purity, weight, image_url")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Manage jewellery load error:", error);
      setManageMessage("Failed to load jewellery.");
      setManageLoading(false);
      return;
    }

    setManagedJewellery((data || []) as ManagedJewellery[]);
    setManageLoading(false);
  }

  function getStoragePathFromUrl(imageUrl: string | null | undefined) {
    if (!imageUrl) return null;

    const marker = "/storage/v1/object/public/jewellery-images/";
    const index = imageUrl.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(imageUrl.substring(index + marker.length));
  }

  function startEditing(item: ManagedJewellery) {
    setEditingId(item.id);
    setEditingName(item.name || "");
    setEditingCategory(item.category || "Rings");
    setManageMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
    setEditingCategory("Rings");
  }

  async function saveEdit(id: string) {
    const name = editingName.trim();

    if (!name) {
      setManageMessage("Jewellery name cannot be empty.");
      return;
    }

    const { data, error } = await supabase
      .from("jewellery")
      .update({
        name,
        category: editingCategory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, name, category, description, purity, weight, image_url")
      .single();

    if (error) {
      console.error("Jewellery update error:", error);
      setManageMessage("Failed to update jewellery.");
      return;
    }

    setManagedJewellery((items) =>
      items.map((item) => (item.id === id ? (data as ManagedJewellery) : item))
    );
    cancelEditing();
    setManageMessage("Jewellery updated successfully.");
  }

  async function deleteJewellery(item: ManagedJewellery) {
    const confirmed = window.confirm(
      `Delete "${item.name}"? This will remove the database record and its uploaded image.`
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setManageMessage("");

    const storagePath = getStoragePathFromUrl(item.image_url);

    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from("jewellery-images")
        .remove([storagePath]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
        setManageMessage(
          `Could not delete the image from Storage. The jewellery record was kept.`
        );
        setDeletingId(null);
        return;
      }
    }

    const { error: databaseError } = await supabase
      .from("jewellery")
      .delete()
      .eq("id", item.id);

    if (databaseError) {
      console.error("Database delete error:", databaseError);
      setManageMessage(
        "Image was removed from Storage, but the database record could not be deleted. Please refresh and check the item."
      );
      setDeletingId(null);
      return;
    }

    setManagedJewellery((items) => items.filter((current) => current.id !== item.id));
    if (editingId === item.id) cancelEditing();
    setManageMessage(`"${item.name}" deleted successfully.`);
    setDeletingId(null);
  }

  const filteredJewellery = managedJewellery.filter((item) => {
    const search = manageSearch.trim().toLowerCase();
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search);
    const matchesCategory =
      manageCategory === "All" || item.category === manageCategory;

    return matchesSearch && matchesCategory;
  });

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-[#D4AF37] text-lg">
          Loading admin dashboard...
        </div>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#D4AF37]/20 bg-black/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#D4AF37]">
              AP JEWELLERY WORKS
            </h1>

            <p className="text-xs text-gray-400 mt-1">
              Admin Dashboard
            </p>
          </div>

          <button
            onClick={logout}
            className="border border-red-500/50 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/10 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Gold Rates */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#D4AF37]">
              Gold Rates
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              Update today's gold rates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* 22K */}
            <div className="border border-[#D4AF37]/20 rounded-2xl p-6 bg-[#0b0b0b]">
              <label className="block text-gray-300 mb-2">
                22K Gold Rate / 8g
              </label>

              <input
                type="number"
                value={rate22k}
                onChange={(e) => setRate22k(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] outline-none"
                placeholder="Enter 22K rate"
              />
            </div>

            {/* 24K */}
            <div className="border border-[#D4AF37]/20 rounded-2xl p-6 bg-[#0b0b0b]">
              <label className="block text-gray-300 mb-2">
                24K Gold Rate / 8g
              </label>

              <input
                type="number"
                value={rate24k}
                onChange={(e) => setRate24k(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] outline-none"
                placeholder="Enter 24K rate"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              onClick={updateGoldRate}
              disabled={rateLoading}
              className="bg-[#D4AF37] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#e5c04a] transition disabled:opacity-50"
            >
              {rateLoading ? "Updating..." : "Update Gold Rates"}
            </button>

            {rateMessage && (
              <p className="text-sm text-gray-300">
                {rateMessage}
              </p>
            )}
          </div>
        </section>

        {/* Bulk Upload */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#D4AF37]">
              Upload Jewellery Images
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              Select up to 100 images, edit their names, and choose categories.
            </p>
          </div>

          {/* Select Images */}
          <div className="border border-dashed border-[#D4AF37]/40 rounded-2xl p-8 bg-[#0b0b0b] text-center">
            <div className="text-5xl mb-4">📸</div>

            <h3 className="text-lg font-semibold mb-2">
              Select Jewellery Images
            </h3>

            <p className="text-gray-500 text-sm mb-5">
              You can select up to 100 images at once.
            </p>

            <label className="inline-block cursor-pointer bg-[#D4AF37] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#e5c04a] transition">
              Select Images

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelection}
                className="hidden"
              />
            </label>

            {uploadItems.length > 0 && (
              <p className="text-[#D4AF37] mt-4 text-sm">
                {uploadItems.length} image
                {uploadItems.length === 1 ? "" : "s"} selected
              </p>
            )}
          </div>

          {/* Image List */}
          {uploadItems.length > 0 && (
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Image Names & Categories
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose one category for all images or change each image individually.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    disabled={uploading}
                    className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-[#D4AF37] outline-none"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={applyCategoryToAll}
                    disabled={uploading}
                    className="border border-[#D4AF37]/50 text-[#D4AF37] px-4 py-2 rounded-lg text-sm hover:bg-[#D4AF37]/10 disabled:opacity-50"
                  >
                    Apply to All
                  </button>

                  <button
                  onClick={clearImages}
                  disabled={uploading}
                  className="text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm hover:bg-red-500/10 disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-3">
                {uploadItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="border border-gray-800 rounded-xl p-4 bg-[#080808]"
                  >
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                      {/* Image preview */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                        <img
                          src={URL.createObjectURL(item.file)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Number + filename */}
                      <div className="lg:w-64">
                        <p className="text-[#D4AF37] text-sm font-semibold">
                          Image {index + 1}
                        </p>

                        <p className="text-xs text-gray-500 mt-1 break-all">
                          {item.file.name}
                        </p>
                      </div>

                      {/* Name */}
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">
                          Jewellery Name
                        </label>

                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateImageName(
                              item.id,
                              e.target.value
                            )
                          }
                          disabled={item.status !== "waiting"}
                          className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] outline-none disabled:opacity-60"
                          placeholder="Enter jewellery name"
                        />
                      </div>

                      {/* Category */}
                      <div className="lg:w-32">
                        <label className="block text-xs text-gray-500 mb-1">
                          Category
                        </label>

                        <select
                          value={item.category}
                          onChange={(e) =>
                            updateImageCategory(item.id, e.target.value)
                          }
                          disabled={item.status !== "waiting"}
                          className="w-full bg-black border border-gray-700 rounded-lg px-3 py-3 text-white focus:border-[#D4AF37] outline-none disabled:opacity-60"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status */}
                      <div className="lg:w-28 text-center">
                        {item.status === "waiting" && (
                          <span className="text-gray-400 text-sm">
                            Waiting
                          </span>
                        )}

                        {item.status === "uploading" && (
                          <span className="text-yellow-400 text-sm">
                            Uploading...
                          </span>
                        )}

                        {item.status === "success" && (
                          <span className="text-green-400 text-sm">
                            ✓ Uploaded
                          </span>
                        )}

                        {item.status === "error" && (
                          <span className="text-red-400 text-sm">
                            ✕ Failed
                          </span>
                        )}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeImage(item.id)}
                        disabled={uploading || item.status !== "waiting"}
                        className="text-red-400 hover:text-red-300 disabled:opacity-30 text-xl"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>

                    {item.error && (
                      <p className="text-red-400 text-xs mt-3">
                        {item.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress */}
              {uploading && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">
                      Uploading images...
                    </span>

                    <span className="text-[#D4AF37]">
                      {uploadProgress}%
                    </span>
                  </div>

                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D4AF37] transition-all duration-300"
                      style={{
                        width: `${uploadProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Upload button */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  onClick={uploadImages}
                  disabled={uploading}
                  className="bg-[#D4AF37] text-black font-bold px-8 py-4 rounded-lg hover:bg-[#e5c04a] transition disabled:opacity-50"
                >
                  {uploading
                    ? "Uploading..."
                    : `Upload ${uploadItems.length} Images`}
                </button>

                {uploadMessage && (
                  <p className="text-sm text-gray-300">
                    {uploadMessage}
                  </p>
                )}
              </div>
            </div>
            </div>
          )}
        </section>

        {/* Manage Jewellery */}
        <section className="mt-10 pb-10">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-[#D4AF37]">
                Manage Jewellery
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                View, edit, categorize, or delete uploaded jewellery.
              </p>
            </div>

            <button
              onClick={loadManagedJewellery}
              disabled={manageLoading}
              className="border border-[#D4AF37]/50 text-[#D4AF37] px-4 py-2 rounded-lg text-sm hover:bg-[#D4AF37]/10 disabled:opacity-50"
            >
              {manageLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="border border-gray-800 rounded-2xl p-4 bg-[#0b0b0b] mb-5">
            <div className="grid md:grid-cols-[1fr_auto] gap-3">
              <input
                type="text"
                value={manageSearch}
                onChange={(e) => setManageSearch(e.target.value)}
                placeholder="Search jewellery name or category..."
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] outline-none"
              />

              <select
                value={manageCategory}
                onChange={(e) => setManageCategory(e.target.value)}
                className="bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] outline-none"
              >
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {manageMessage && (
            <div className="mb-5 border border-[#D4AF37]/20 bg-[#0b0b0b] rounded-lg px-4 py-3 text-sm text-gray-300">
              {manageMessage}
            </div>
          )}

          {manageLoading ? (
            <div className="border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
              Loading jewellery...
            </div>
          ) : filteredJewellery.length === 0 ? (
            <div className="border border-gray-800 rounded-2xl p-8 text-center text-gray-500">
              No jewellery found.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredJewellery.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-800 rounded-2xl overflow-hidden bg-[#080808]"
                >
                  <div className="aspect-square bg-gray-900">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        💍
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {editingId === item.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-[#D4AF37] outline-none"
                          placeholder="Jewellery name"
                        />

                        <select
                          value={editingCategory}
                          onChange={(e) => setEditingCategory(e.target.value)}
                          className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-[#D4AF37] outline-none"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>

                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="flex-1 bg-[#D4AF37] text-black font-bold px-3 py-2 rounded-lg hover:bg-[#e5c04a]"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex-1 border border-gray-700 text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-white truncate">
                          {item.name}
                        </h3>
                        <p className="text-[#D4AF37] text-sm mt-1">
                          {item.category}
                        </p>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <button
                            onClick={() => startEditing(item)}
                            disabled={deletingId === item.id}
                            className="border border-[#D4AF37]/40 text-[#D4AF37] px-3 py-2 rounded-lg text-sm hover:bg-[#D4AF37]/10 disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteJewellery(item)}
                            disabled={deletingId === item.id}
                            className="border border-red-500/40 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {deletingId === item.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </>
                    )}
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