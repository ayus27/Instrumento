import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SAMPLE_SONGS } from "@/lib/songs/sampleSongs";
import { controlButtonClass } from "@/components/instrument/ControlBar";

export const Route = createFileRoute("/admin/songs")({
  head: () => ({
    meta: [
      { title: "Song Management Admin — Instrumento" },
    ],
  }),
  component: AdminSongsPage,
});

function AdminSongsPage() {
  const [songsList, setSongsList] = useState(SAMPLE_SONGS);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    key: "C",
    bpm: 100,
    genre: "Pop",
  });

  const handleSave = (e) => {
    e.preventDefault();
    const newSong = {
      id: formData.title.toLowerCase().replace(/\s+/g, "-"),
      ...formData,
      sections: [],
    };
    setSongsList((prev) => [newSong, ...prev]);
    setIsEditing(false);
    setFormData({ title: "", artist: "", album: "", key: "C", bpm: 100, genre: "Pop" });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 space-y-8">
      <header className="hairline pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">Admin · Song Management</h1>
          <p className="label-mono mt-1">Manage Public Catalog & Authorized Song Data</p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`${controlButtonClass} bg-signal text-primary-foreground`}
        >
          {isEditing ? "Cancel" : "+ Add New Song"}
        </button>
      </header>

      {isEditing && (
        <form onSubmit={handleSave} className="panel p-6 space-y-4 max-w-2xl">
          <h3 className="font-display text-xl uppercase tracking-tight">Add New Song Entry</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-mono block mb-1">Song Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full panel p-2 bg-background font-mono text-xs text-foreground"
              />
            </div>
            <div>
              <label className="label-mono block mb-1">Artist</label>
              <input
                type="text"
                required
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="w-full panel p-2 bg-background font-mono text-xs text-foreground"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label-mono block mb-1">Key</label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full panel p-2 bg-background font-mono text-xs text-foreground"
              />
            </div>
            <div>
              <label className="label-mono block mb-1">BPM</label>
              <input
                type="number"
                value={formData.bpm}
                onChange={(e) => setFormData({ ...formData, bpm: Number(e.target.value) })}
                className="w-full panel p-2 bg-background font-mono text-xs text-foreground"
              />
            </div>
            <div>
              <label className="label-mono block mb-1">Genre</label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full panel p-2 bg-background font-mono text-xs text-foreground"
              />
            </div>
          </div>

          <button type="submit" className={`${controlButtonClass} bg-signal text-primary-foreground mt-2`}>
            Save Song to Catalog
          </button>
        </form>
      )}

      <div className="panel p-5 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-panel-edge text-muted-foreground uppercase label-mono">
              <th className="pb-3">Title</th>
              <th className="pb-3">Artist</th>
              <th className="pb-3">Key</th>
              <th className="pb-3">BPM</th>
              <th className="pb-3">Genre</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-edge">
            {songsList.map((s) => (
              <tr key={s.id} className="hover:bg-accent">
                <td className="py-3 font-bold text-foreground">{s.title}</td>
                <td className="py-3 text-muted-foreground">{s.artist}</td>
                <td className="py-3 text-signal">{s.key}</td>
                <td className="py-3">{s.bpm}</td>
                <td className="py-3">{s.genre}</td>
                <td className="py-3 text-right space-x-2">
                  <button type="button" className={controlButtonClass}>Edit</button>
                  <button
                    type="button"
                    onClick={() => setSongsList((prev) => prev.filter((item) => item.id !== s.id))}
                    className={`${controlButtonClass} text-destructive`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
