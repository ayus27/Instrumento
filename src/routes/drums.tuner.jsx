import { createFileRoute, redirect } from "@tanstack/react-router";

// The drum tuner now lives with the other tuners.
export const Route = createFileRoute("/drums/tuner")({
  staticData: { sitemap: false },
  beforeLoad: () => {
    throw redirect({ to: "/tuners/drums" });
  },
});
