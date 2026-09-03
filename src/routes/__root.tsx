import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useCallback, useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AppearanceProvider, useAppearance } from "@/lib/appearance";
import { AuthProvider } from "@/lib/auth-client";
import { AppearanceMenu } from "@/components/AppearanceMenu";
import { AccountMenu } from "@/components/AccountMenu";


import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Instrumento — Playable Browser Instruments" },
      {
        name: "description",
        content:
          "Play piano, guitar, drums and ukulele in the browser, with metronome, recording and microphone tuners.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const NAV = [
  { to: "/piano", label: "Piano" },
  { to: "/guitar", label: "Guitar" },
  { to: "/drums", label: "Drums" },
  { to: "/ukulele", label: "Ukulele" },
  { to: "/songs", label: "Songs" },
  { to: "/practice", label: "Practice" },

  { to: "/tuners/guitar", label: "Gtr Tuner" },
  { to: "/tuners/ukulele", label: "Uke Tuner" },
  { to: "/recordings", label: "Recordings" },
] as const;

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppearanceProvider>
        <AuthBridge>
          <div className="flex min-h-screen flex-col">
            <header
              className="hairline sticky top-0 z-30 backdrop-blur-sm"
              style={{ backgroundColor: "color-mix(in oklch, var(--background) 88%, transparent)" }}
            >
              <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
                <Link to="/" className="font-display text-lg uppercase tracking-[0.18em]">
                  Instru<span style={{ color: "var(--signal)" }}>mento</span>
                </Link>
                <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="label-mono transition-colors hover:text-foreground"
                      activeProps={{ style: { color: "var(--signal)" } }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="ml-auto flex items-center gap-3">
                  <AppearanceMenu />
                  <AccountMenu />
                </div>
              </div>
            </header>
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <main className="flex-1">
              <Outlet />
            </main>
          </div>
        </AuthBridge>
      </AppearanceProvider>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}

// Syncs account-stored appearance preferences into the appearance context on sign-in.
function AuthBridge({ children }: { children: ReactNode }) {
  const { setAppearance } = useAppearance();
  const onPreferences = useCallback(
    (prefs: { theme: string; primary_color: string; accent_color: string }) => {
      setAppearance(prefs, { persistToAccount: false });
    },
    [setAppearance],
  );
  return <AuthProvider onPreferences={onPreferences}>{children}</AuthProvider>;
}

