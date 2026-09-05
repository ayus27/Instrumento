import { supabase } from "../../integrations/supabase/client";
import { ProjectState, Track, Clip } from "./project-state";

export async function fetchProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*, tracks(count)")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createProject(name = "Untitled Project", bpm = 120) {
  const { data, error } = await supabase
    .from("projects")
    .insert([{ name, bpm }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveProjectState(project: ProjectState) {
  // First update project info
  const { error: pError } = await supabase
    .from("projects")
    .update({ name: project.name, bpm: project.bpm, updated_at: new Date().toISOString() })
    .eq("id", project.id);

  if (pError) throw pError;

  // Real implementation would sync tracks and clips here using upsert
  // For now, this is a skeleton for the DB schema created in Stage 13.
  return true;
}

export async function uploadAudioClip(clipId: string, audioBlob: Blob) {
  const fileName = `${clipId}-${Date.now()}.webm`;
  const { data, error } = await supabase.storage
    .from("recordings")
    .upload(fileName, audioBlob, { contentType: "audio/webm" });

  if (error) throw error;
  return data.path;
}
