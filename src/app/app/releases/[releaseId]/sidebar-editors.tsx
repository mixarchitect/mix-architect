"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { Panel, PanelBody } from "@/components/ui/panel";
import { Pencil, Plus, Check, X } from "lucide-react";

type DirectionEditorProps = {
  releaseId: string;
  initialValue: string | null;
};

export function GlobalDirectionEditor({ releaseId, initialValue }: DirectionEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [editing]);

  async function handleSave() {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("releases")
      .update({ global_direction: value || null })
      .eq("id", releaseId);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <Panel>
      <PanelBody className="py-5">
        <div className="flex items-center justify-between mb-2">
          <div className="label text-faint text-[10px]">GLOBAL MIX DIRECTION</div>
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
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input min-h-[80px] resize-y text-sm w-full"
              placeholder="Overall sonic vision for this release..."
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
                style={{ background: "var(--signal)", color: "#fff" }}
              >
                <Check size={12} />
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue(initialValue ?? "");
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
        ) : value ? (
          <p className="text-sm text-text leading-relaxed">{value}</p>
        ) : (
          <p className="text-sm text-muted italic">No global direction set yet.</p>
        )}
      </PanelBody>
    </Panel>
  );
}

type Ref = {
  id: string;
  song_title: string;
  artist: string | null;
  note: string | null;
};

type RefsEditorProps = {
  releaseId: string;
  initialRefs: Ref[];
};

export function GlobalReferencesEditor({ releaseId, initialRefs }: RefsEditorProps) {
  const [refs, setRefs] = useState<Ref[]>(initialRefs);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function startEdit(ref: Ref) {
    setEditingId(ref.id);
    setSongTitle(ref.song_title);
    setArtist(ref.artist ?? "");
    setNote(ref.note ?? "");
    setAdding(false);
  }

  function resetForm() {
    setSongTitle("");
    setArtist("");
    setNote("");
    setAdding(false);
    setEditingId(null);
  }

  async function handleAdd() {
    if (!songTitle.trim()) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("mix_references")
      .insert({
        release_id: releaseId,
        track_id: null,
        song_title: songTitle.trim(),
        artist: artist.trim() || null,
        note: note.trim() || null,
        sort_order: refs.length,
      })
      .select()
      .single();
    if (data) {
      setRefs([...refs, data as Ref]);
    }
    setSaving(false);
    resetForm();
    router.refresh();
  }

  async function handleUpdate() {
    if (!editingId || !songTitle.trim()) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("mix_references")
      .update({
        song_title: songTitle.trim(),
        artist: artist.trim() || null,
        note: note.trim() || null,
      })
      .eq("id", editingId);
    setRefs(refs.map((r) =>
      r.id === editingId
        ? { ...r, song_title: songTitle.trim(), artist: artist.trim() || null, note: note.trim() || null }
        : r
    ));
    setSaving(false);
    resetForm();
    router.refresh();
  }

  async function handleDelete(id: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("mix_references").delete().eq("id", id);
    setRefs(refs.filter((r) => r.id !== id));
    router.refresh();
  }

  const isFormOpen = adding || editingId;

  return (
    <Panel>
      <PanelBody className="py-5">
        <div className="flex items-center justify-between mb-2">
          <div className="label text-faint text-[10px]">GLOBAL REFERENCES</div>
          {!isFormOpen && (
            <button
              type="button"
              onClick={() => { resetForm(); setAdding(true); }}
              className="text-muted hover:text-text transition-colors flex items-center gap-0.5 text-xs"
            >
              <Plus size={13} /> Add
            </button>
          )}
        </div>

        {refs.length > 0 ? (
          <div className="space-y-2">
            {refs.map((ref) => (
              <div key={ref.id} className="group text-sm">
                {editingId === ref.id ? (
                  <RefForm
                    songTitle={songTitle}
                    artist={artist}
                    note={note}
                    onSongTitleChange={setSongTitle}
                    onArtistChange={setArtist}
                    onNoteChange={setNote}
                    onSave={handleUpdate}
                    onCancel={resetForm}
                    saving={saving}
                    saveLabel="Update"
                  />
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-text">{ref.song_title}</div>
                      {ref.artist && (
                        <div className="text-xs text-muted">{ref.artist}</div>
                      )}
                      {ref.note && (
                        <div className="text-xs text-muted mt-0.5 italic">
                          &ldquo;{ref.note}&rdquo;
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(ref)}
                        className="text-muted hover:text-text transition-colors p-0.5"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ref.id)}
                        className="text-muted hover:text-red-500 transition-colors p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : !adding ? (
          <p className="text-sm text-muted italic">No references added yet.</p>
        ) : null}

        {adding && (
          <div className={refs.length > 0 ? "mt-3" : ""}>
            <RefForm
              songTitle={songTitle}
              artist={artist}
              note={note}
              onSongTitleChange={setSongTitle}
              onArtistChange={setArtist}
              onNoteChange={setNote}
              onSave={handleAdd}
              onCancel={resetForm}
              saving={saving}
              saveLabel="Add"
            />
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}

function RefForm({
  songTitle, artist, note,
  onSongTitleChange, onArtistChange, onNoteChange,
  onSave, onCancel, saving, saveLabel,
}: {
  songTitle: string;
  artist: string;
  note: string;
  onSongTitleChange: (v: string) => void;
  onArtistChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  saveLabel: string;
}) {
  return (
    <div className="space-y-2 p-2 rounded-md" style={{ background: "var(--panel2)" }}>
      <input
        type="text"
        value={songTitle}
        onChange={(e) => onSongTitleChange(e.target.value)}
        className="input text-xs"
        placeholder="Song title"
        autoFocus
      />
      <input
        type="text"
        value={artist}
        onChange={(e) => onArtistChange(e.target.value)}
        className="input text-xs"
        placeholder="Artist"
      />
      <input
        type="text"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        className="input text-xs"
        placeholder="What to reference about this song"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !songTitle.trim()}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
          style={{ background: "var(--signal)", color: "#fff" }}
        >
          <Check size={12} />
          {saving ? "Saving…" : saveLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-muted hover:text-text transition-colors"
          style={{ background: "var(--bg)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
