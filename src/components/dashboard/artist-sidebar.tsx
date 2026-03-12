"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody } from "@/components/ui/panel";
import { ClientNotesEditor } from "@/app/app/releases/[releaseId]/sidebar-editors";
import { ArtistPhotoUploader } from "@/components/ui/artist-photo-uploader";

type Props = {
  artistName: string;
  userId: string;
  initialClientName: string;
  initialClientEmail: string;
  initialClientPhone: string;
  initialNotes: string;
  customPhotoUrl?: string | null;
  fallbackCoverUrl?: string | null;
};

export function ArtistInfoBar({
  artistName,
  userId,
  initialClientName,
  initialClientEmail,
  initialClientPhone,
  initialNotes,
  customPhotoUrl = null,
  fallbackCoverUrl = null,
}: Props) {
  return (
    <div className="space-y-4 mb-6">
      {/* Artist identity row: photo + name */}
      <div className="flex items-center gap-4">
        <ArtistPhotoUploader
          artistName={artistName}
          currentPhotoUrl={customPhotoUrl}
          fallbackCoverUrl={fallbackCoverUrl}
          size="lg"
        />
        <ArtistNameEditor artistName={artistName} userId={userId} />
      </div>

      {/* Contact + notes grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ContactInfoEditor
          artistName={artistName}
          userId={userId}
          initialName={initialClientName}
          initialEmail={initialClientEmail}
          initialPhone={initialClientPhone}
        />
        <ClientNotesEditor
          clientEmail={initialClientEmail || undefined}
          artistName={artistName}
          initialNotes={initialNotes}
        />
      </div>
    </div>
  );
}

/* ── Artist Name Editor ── */
function ArtistNameEditor({
  artistName,
  userId,
}: {
  artistName: string;
  userId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(artistName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === artistName) {
      setName(artistName);
      setEditing(false);
      return;
    }

    const confirmed = window.confirm(
      `This will rename "${artistName}" to "${trimmed}" across all releases. Continue?`,
    );
    if (!confirmed) return;

    setSaving(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    try {
      // Update all releases with this artist name
      const { error: relErr } = await supabase
        .from("releases")
        .update({ artist: trimmed })
        .eq("user_id", userId)
        .ilike("artist", artistName);
      if (relErr) throw relErr;

      // Update artist_photos key if exists
      const oldKey = artistName.toLowerCase().trim();
      const newKey = trimmed.toLowerCase();
      if (oldKey !== newKey) {
        await supabase
          .from("artist_photos")
          .update({ artist_name_key: newKey })
          .eq("user_id", userId)
          .eq("artist_name_key", oldKey);

        // Update client_notes key if using artist: prefix
        await supabase
          .from("client_notes")
          .update({ client_email: `artist:${newKey}` })
          .eq("engineer_id", userId)
          .eq("client_email", `artist:${oldKey}`);
      }

      setEditing(false);
      router.push(`/app?artist=${encodeURIComponent(trimmed)}`);
      router.refresh();
    } catch {
      setError("Failed to rename artist");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input text-lg font-semibold flex-1 min-w-0"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setName(artistName);
                setEditing(false);
              }
            }}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0"
            style={{ background: "var(--signal)", color: "var(--signal-on)" }}
          >
            <Check size={12} />
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setName(artistName);
              setEditing(false);
              setError("");
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md text-muted hover:text-text transition-colors shrink-0"
            style={{ background: "var(--panel2)" }}
          >
            <X size={12} />
          </button>
        </div>
        <p className="text-[10px] text-muted">
          Renaming updates all releases by this artist
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group flex items-center gap-2 min-w-0"
    >
      <span className="text-lg font-semibold text-text truncate">
        {artistName}
      </span>
      <Pencil
        size={14}
        className="text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      />
    </button>
  );
}

/* ── Contact Info Editor ── */
function ContactInfoEditor({
  artistName,
  userId,
  initialName,
  initialEmail,
  initialPhone,
}: {
  artistName: string;
  userId: string;
  initialName: string;
  initialEmail: string;
  initialPhone: string;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("releases")
        .update({
          client_name: name || null,
          client_email: email || null,
          client_phone: phone || null,
        })
        .eq("user_id", userId)
        .ilike("artist", artistName);
      if (error) throw error;
      setEditing(false);
      router.refresh();
    } catch {
      // Keep editing open
    } finally {
      setSaving(false);
    }
  }, [name, email, phone, userId, artistName, router]);

  return (
    <Panel>
      <PanelBody className="py-5">
        <div className="flex items-center justify-between mb-3">
          <div className="label-sm text-muted">CLIENT CONTACT</div>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-muted hover:text-text transition-colors"
            >
              <Pencil size={13} />
            </button>
          )}
        </div>
        {editing ? (
          <div className="space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input text-sm w-full"
              placeholder="Client name"
              autoFocus
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input text-sm w-full"
              placeholder="Client email"
              type="email"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input text-sm w-full"
              placeholder="Client phone"
              type="tel"
            />
            <p className="text-[10px] text-muted">
              Saves to all releases by {artistName}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
                style={{ background: "var(--signal)", color: "var(--signal-on)" }}
              >
                <Check size={12} />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setName(initialName);
                  setEmail(initialEmail);
                  setPhone(initialPhone);
                  setEditing(false);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-muted hover:text-text transition-colors"
                style={{ background: "var(--panel2)" }}
              >
                <X size={12} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            {name ? (
              <div className="flex justify-between">
                <span className="text-muted">Name</span>
                <span className="text-text">{name}</span>
              </div>
            ) : null}
            {email ? (
              <div className="flex justify-between">
                <span className="text-muted">Email</span>
                <a href={`mailto:${email}`} className="text-signal text-xs hover:underline">{email}</a>
              </div>
            ) : null}
            {phone ? (
              <div className="flex justify-between">
                <span className="text-muted">Phone</span>
                <a href={`tel:${phone}`} className="text-signal text-xs hover:underline">{phone}</a>
              </div>
            ) : null}
            {!name && !email && !phone && (
              <p className="text-sm text-muted italic">No contact info set.</p>
            )}
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}
