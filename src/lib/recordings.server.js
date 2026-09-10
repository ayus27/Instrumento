import { supabaseServer } from "./supabase.server";
import crypto from "crypto";

/**
 * Upload a recording to Supabase Storage and save its metadata.
 */
export async function saveRecording({
    file,
    contentType,
    userId,
    title = "Untitled Recording",
    duration = null,
}) {
    if (!file) throw new Error("Recording file is required.");
    if (!userId) throw new Error("User ID is required.");

    const supabaseAdmin = supabaseServer();
    const recordingId = crypto.randomUUID();
    const extension = contentType === "audio/mp4" ? "mp4" : "webm";
    const storagePath = `${userId}/${recordingId}.${extension}`;

    // 1. Upload audio to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
        .from("recordings")
        .upload(storagePath, file, {
            contentType: contentType || "audio/webm",
            upsert: false,
        });

    if (uploadError) {
        throw new Error(`Failed to upload recording: ${uploadError.message}`);
    }

    // 2. Save recording metadata in the database
    const { data, error: databaseError } = await supabaseAdmin
        .from("recordings")
        .insert({
            id: recordingId,
            user_id: userId,
            title,
            file_path: storagePath,
            content_type: contentType || "audio/webm",
            duration,
        })
        .select()
        .single();

    if (databaseError) {
        // If database insertion fails, remove the uploaded file
        await supabaseAdmin.storage.from("recordings").remove([storagePath]);
        throw new Error(`Failed to save recording metadata: ${databaseError.message}`);
    }

    return data;
}