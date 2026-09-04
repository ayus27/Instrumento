import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { AppearanceMenu } from "@/components/AppearanceMenu";
import { AccountMenu } from "@/components/AccountMenu";
import logo from "@/assets/instrumento-wordmark.png.asset.json";

const GROUPS = [
  {
    label: "Play",
    items: [
      { to: "/piano", label: "Piano" },
      { to: "/guitar", label: "Guitar" },
      { to: "/drums", label: "Drums" },
      { to: "/ukulele", label: "Ukulele" },
    ],
  },
  {
    label: "Learn",
    items: [
      { to: "/practice", label: "Practice" },
      { to: "/chords", label: "Chords" },
      { to: "/songs", label: "Songs" },
    ],
  },
  {
    label: "Create",
    items: [
      { to: "/jam", label: "Jam Mode" },
      { to: "/grooves", label: "Grooves" },
      { to: "/recordings", label: "Recordings" },
    ],
  },
  {
    label: "Tuners",
    items: [
      { to: "/tuners/guitar", label: "Guitar Tuner" },
      { to: "/tuners/ukulele", label: "Ukulele Tuner" },
      { to: "/tuners/drums", label: "Drum Tuner" },
    ],
  },
];

function Logo({ onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="Instrumento — home"
      className="shrink-0 transition-opacity hover:opacity-80"
    >
      <img
        src={logo.url}
        alt="Instrumento"
        className="logo-mark h-7 w-auto sm:h-8"
        width={481}
        height={160}
      />
    </Link>
  );
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);

  useEffect(() => {
    setOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <header
      className="hairline sticky top-0 z-40 backdrop-blur-sm"
      style={{ backgroundColor: "color-mix(in oklch, var(--background) 92%, transparent)" }}
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-5">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden min-w-0 items-center gap-1 lg:flex">
          {GROUPS.map((group) => {
            const groupActive = group.items.some((i) => isActive(i.to));
            return (
              <div key={group.label} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
                  onMouseEnter={() => setOpenGroup(group.label)}
                  aria-expanded={openGroup === group.label}
                  className="flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  style={groupActive ? { color: "var(--signal)" } : undefined}
                >
                  {group.label}
                  <ChevronDown className="h-3 w-3" aria-hidden />
                </button>
                {openGroup === group.label && (
                  <div
                    onMouseLeave={() => setOpenGroup(null)}
                    className="panel absolute left-0 top-full z-50 mt-1 w-52 p-1.5 shadow-lg"
                    style={{ backgroundColor: "var(--popover)" }}
                  >
                    {group.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="block rounded-lg px-3 py-2 text-[13px] transition-colors hover:bg-accent hover:text-foreground"
                        activeProps={{ style: { color: "var(--signal)" } }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </nav>
        <div className="lg:hidden" />

        <div className="flex items-center gap-2 justify-self-end">
          <AppearanceMenu />
          <AccountMenu />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="panel grid h-9 w-9 place-items-center lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}

          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="hairline max-h-[70vh] overflow-y-auto px-4 pb-5 lg:hidden">
          {GROUPS.map((group) => (
            <div key={group.label} className="mt-4">
              <p className="label-mono text-muted-foreground">{group.label}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="panel px-3 py-3 font-display text-sm uppercase tracking-wide"
                    activeProps={{ style: { color: "var(--signal)" } }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
