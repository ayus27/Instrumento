import { createServerFn } from "@tanstack/react-start";
import { saveRecording } from "./recordings.server";
import { supabaseServer } from "./supabase.server";

export const saveRecordingFn = createServerFn({ method: "POST" })
  .validator((data) => {
    return data; // { token, fileData, contentType, title, duration }
  })
  .handler(async ({ data }) => {
    const { token, fileData, contentType, title, duration } = data;

    if (!token) {
      throw new Error("Unauthenticated. Token is required.");
    }

    // Verify token using Supabase admin client
    const { data: { user }, error } = await supabaseServer().auth.getUser(token);
    if (error || !user) {
      throw new Error("Unauthenticated. Invalid token.");
    }

    // Decode base64 to buffer
    const buffer = Buffer.from(fileData, "base64");

    const recording = await saveRecording({
      file: buffer,
      contentType,
      userId: user.id,
      title,
      duration,
    });

    return recording;
  });
