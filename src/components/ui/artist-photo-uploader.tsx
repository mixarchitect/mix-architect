"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Upload, X, Check, ImageIcon } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { ArtistPhoto } from "./artist-photo";

type Props = {
  artistName: string;
  currentPhotoUrl: string | null;
  fallbackCoverUrl: string | null;
  size?: "sm" | "md" | "lg";
};

const SIZES = { sm: 40, md: 48, lg: 64 } as const;

export function ArtistPhotoUploader({
  artistName,
  currentPhotoUrl,
  fallbackCoverUrl,
  size = "md",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(currentPhotoUrl);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const displayUrl = url ?? fallbackCoverUrl;
  const px = SIZES[size];

  function sanitizeName(name: string) {
    return name.toLowerCase().trim().replace(/[^a-z0-9]/g, "-");
  }

  async function handleUpload(file: File) {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError("Image must be under 5MB");
      return;
    }
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid image type. Use PNG, JPG, WebP, or GIF.");
      return;
    }
    setUploading(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
      const path = `${user.id}/artist-${sanitizeName(artistName)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("cover-art")
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("cover-art").getPublicUrl(path);
      const newUrl = urlData.publicUrl + `?t=${Date.now()}`;
      // Upsert artist_photos row
      await supabase.from("artist_photos").upsert(
        {
          user_id: user.id,
          artist_name_key: artistName.toLowerCase().trim(),
          photo_url: newUrl,
        },
        { onConflict: "user_id,artist_name_key" },
      );
      setUrl(newUrl);
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleUrlSave() {
    if (!urlInput.trim()) return;
    setError("");
    const supabase = createSupabaseBrowserClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      await supabase.from("artist_photos").upsert(
        {
          user_id: user.id,
          artist_name_key: artistName.toLowerCase().trim(),
          photo_url: urlInput.trim(),
        },
        { onConflict: "user_id,artist_name_key" },
      );
      setUrl(urlInput.trim());
      setUrlInput("");
      setEditing(false);
      router.refresh();
    } catch {
      setError("Failed to save URL");
    }
  }

  async function handleRemove() {
    setError("");
    const supabase = createSupabaseBrowserClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      await supabase
        .from("artist_photos")
        .delete()
        .eq("user_id", user.id)
        .eq("artist_name_key", artistName.toLowerCase().trim());
      setUrl(null);
      setEditing(false);
      router.refresh();
    } catch {
      setError("Failed to remove photo");
    }
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-border overflow-hidden" style={{ width: 200 }}>
        {/* Preview */}
        <div
          className="w-full aspect-square flex items-center justify-center"
          style={{ background: "var(--panel2)" }}
        >
          {displayUrl ? (
            <img src={displayUrl} alt={artistName} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={48} className="text-muted opacity-30" />
          )}
        </div>

        {/* Controls */}
        <div className="p-3 space-y-2" style={{ background: "var(--panel)" }}>
          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center gap-2">
            <label
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors"
              style={{ background: "var(--panel2)", color: "var(--text-muted)" }}
            >
              <Upload size={14} />
              {uploading ? "Uploading\u2026" : "Upload"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                }}
                disabled={uploading}
              />
            </label>
            {url && (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"
              >
                <X size={12} /> Remove
              </button>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-muted uppercase tracking-wider">or paste URL</span>
            <div className="flex gap-1.5">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="input text-xs flex-1"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={handleUrlSave}
                disabled={!urlInput.trim()}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-40"
                style={{ background: "var(--signal)", color: "var(--signal-on)" }}
              >
                <Check size={12} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setUrlInput("");
              setError("");
              setEditing(false);
            }}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-text transition-colors"
          >
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  // Display mode: photo with hover overlay
  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group relative rounded-full overflow-hidden cursor-pointer shrink-0"
      style={{ width: px, height: px }}
    >
      <ArtistPhoto artistName={artistName} photoUrl={displayUrl} size={size} />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center rounded-full">
        <Pencil
          size={px * 0.35}
          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </button>
  );
}
