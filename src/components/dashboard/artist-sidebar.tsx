"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody } from "@/components/ui/panel";
import { ClientNotesEditor } from "@/app/app/releases/[releaseId]/sidebar-editors";

type Props = {
  artistName: string;
  userId: string;
  initialClientName: string;
  initialClientEmail: string;
  initialNotes: string;
};

export function ArtistInfoBar({
  artistName,
  userId,
  initialClientName,
  initialClientEmail,
  initialNotes,
}: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <ContactInfoEditor
        artistName={artistName}
        userId={userId}
        initialName={initialClientName}
        initialEmail={initialClientEmail}
      />
      {initialClientEmail && (
        <ClientNotesEditor
          clientEmail={initialClientEmail}
          initialNotes={initialNotes}
        />
      )}
    </div>
  );
}

function ContactInfoEditor({
  artistName,
  userId,
  initialName,
  initialEmail,
}: {
  artistName: string;
  userId: string;
  initialName: string;
  initialEmail: string;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
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
  }, [name, email, userId, artistName, router]);

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
                <span className="text-text text-xs">{email}</span>
              </div>
            ) : null}
            {!name && !email && (
              <p className="text-sm text-muted italic">No contact info set.</p>
            )}
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}
