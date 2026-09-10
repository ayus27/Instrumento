import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { controlButtonClass } from "@/components/instrument/ControlBar";
import {
  deleteRecording,
  loadRecordings,
  playEvents,
  type SavedRecording,
} from "@/lib/audio/recorder";
import { getEngine, type InstrumentId } from "@/lib/audio/engine";
import { supabaseClient } from "@/lib/supabase.client";
import { useAuth } from "@/lib/auth-client";

export const Route = createFileRoute("/recordings")({
  head: () => ({
    meta: [
      { title: "Recordings — Instrumento" },
      {
        name: "description",
        content:
          "Replay and manage performances captured in Instrumento — every take is stored as note events and replayed through the same audio engine.",
      },
      { property: "og:title", content: "Recordings — Instrumento" },
      {
        property: "og:description",
        content: "Replay and manage takes recorded in Instrumento.",
      },
    ],
  }),
  component: RecordingsPage,
});

function RecordingsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedRecording[]>([]);
  const [stopFn, setStopFn] = useState<null | (() => void)>(null);

  const [cloudRecordings, setCloudRecordings] = useState<any[]>([]);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [playingCloudUrl, setPlayingCloudUrl] = useState<string | null>(null);

  useEffect(() => {
    setItems(loadRecordings());
  }, []);

  const loadCloud = async () => {
    if (!user) {
      setCloudRecordings([]);
      return;
    }
    setLoadingCloud(true);
    const { data, error } = await supabaseClient
      .from("recordings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setCloudRecordings(data);
    setLoadingCloud(false);
  };

  useEffect(() => {
    void loadCloud();
  }, [user]);

  const playCloud = async (filePath: string) => {
    const { data, error } = await supabaseClient.storage
      .from("recordings")
      .createSignedUrl(filePath, 3600);

    if (data?.signedUrl) {
      setPlayingCloudUrl(data.signedUrl);
    }
  };

  const deleteCloud = async (id: string, filePath: string) => {
    await supabaseClient.from("recordings").delete().eq("id", id);
    await supabaseClient.storage.from("recordings").remove([filePath]);
    void loadCloud();
  };

  const play = async (rec: SavedRecording) => {
    stopFn?.();
    const voice = await getEngine().load(rec.instrument as InstrumentId);
    const stop = playEvents(
      rec.events,
      {
        attack: (note, velocity) => voice.attack(note, velocity),
        release: (note) => voice.release(note),
        hit: (pad, velocity) => voice.hit(pad, velocity),
      },
      () => setStopFn(null),
    );
    setStopFn(() => stop);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 space-y-12">
      <div>
        <header className="hairline pb-4">
          <h1 className="font-display text-4xl uppercase tracking-tight">Cloud Audio</h1>
          <p className="label-mono mt-1">
            Microphone takes stored securely in your Supabase account
          </p>
        </header>

        {!user ? (
          <p className="mt-8 font-mono text-sm text-muted-foreground">
            Sign in to access your cloud recordings.
          </p>
        ) : loadingCloud ? (
          <p className="mt-8 font-mono text-sm text-muted-foreground">Loading...</p>
        ) : cloudRecordings.length === 0 ? (
          <p className="mt-8 font-mono text-sm text-muted-foreground">
            No audio takes yet. Record your mic in the Studio and save.
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {cloudRecordings.map((rec) => (
              <li
                key={rec.id}
                className="panel flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-display text-lg">{rec.title}</p>
                  <p className="label-mono mt-1">
                    {new Date(rec.created_at).toLocaleDateString()} · {rec.content_type}
                    {rec.duration ? ` · ${rec.duration}s` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className={controlButtonClass} onClick={() => void playCloud(rec.file_path)}>
                    ▶ Play
                  </button>
                  <button
                    type="button"
                    className={controlButtonClass}
                    onClick={() => void deleteCloud(rec.id, rec.file_path)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {playingCloudUrl && (
          <div className="mt-4 p-4 panel border-signal border sticky bottom-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">Now Playing</h3>
              <button className="text-xs" onClick={() => setPlayingCloudUrl(null)}>Close</button>
            </div>
            <audio src={playingCloudUrl} autoPlay controls className="w-full h-8" />
          </div>
        )}
      </div>

      <div>
        <header className="hairline pb-4">
          <h1 className="font-display text-4xl uppercase tracking-tight">Local Events</h1>
          <p className="label-mono mt-1">
            Stored in this browser · Note events replayed by the live instrument engine
          </p>
        </header>

        {items.length === 0 ? (
          <p className="mt-8 font-mono text-sm text-muted-foreground">
            No local takes yet.
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {items.map((rec) => (
              <li
                key={rec.id}
                className="panel flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-display text-lg">{rec.name}</p>
                  <p className="label-mono mt-1">
                    {rec.instrument} · {rec.bpm} bpm · {(rec.duration / 1000).toFixed(1)}s ·{" "}
                    {rec.events.length} events
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className={controlButtonClass} onClick={() => void play(rec)}>
                    ▶ Play
                  </button>
                  <button
                    type="button"
                    className={controlButtonClass}
                    onClick={() => {
                      stopFn?.();
                      setStopFn(null);
                    }}
                  >
                    ■ Stop
                  </button>
                  <button
                    type="button"
                    className={controlButtonClass}
                    onClick={() => {
                      deleteRecording(rec.id);
                      setItems(loadRecordings());
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
