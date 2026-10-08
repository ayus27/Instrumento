import { createFileRoute, redirect } from "@tanstack/react-router";

/** Beat Lab merged into the Groove Generator — keep the old URL working. */
export const Route = createFileRoute("/create/beat-lab")({
  staticData: { sitemap: false },
  beforeLoad: () => {
    throw redirect({ to: "/grooves" });
  },
  component: () => null,
});
