// Grinrex IoT — site navigation. Persistent header across all pages, with the chapter route,
// a mobile drawer, and a live-demo shortcut that carries the signal-lime accent.
import { useEffect, useState } from "react";
import { Activity, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { BrandMark } from "./BrandMark";
import { chapters } from "@/content";

const routeLinks = [
  { label: "Home", path: "/" },
  ...chapters.map((chapter) => ({ label: chapter.label, path: chapter.path })),
] as const;

export function SiteNav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const isActive = (path: string) => (path === "/" ? location === "/" : location.startsWith(path));

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#102219]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.75rem] max-w-[1520px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Grinrex IoT home">
          <BrandMark size={32} />
          <span className="interface text-sm font-extrabold tracking-[.12em] text-[#efffd3]">
            GRINREX<span className="text-[#b8f15a]">/</span>IOT
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
          {routeLinks.map((link, index) => (
            <Link
              key={link.path}
              href={link.path}
              className={`interface rounded-full px-3 py-2 text-[.6rem] font-bold uppercase tracking-[.07em] transition-colors ${
                isActive(link.path) ? "bg-[#b8f15a]/12 text-[#b8f15a]" : "nav-link"
              }`}
            >
              {link.path !== "/" && <span className="mr-1 text-[#d9a35c]">{String(index).padStart(2, "0")}</span>}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/demo" className="cta-button cta-primary hidden !px-5 !py-2.5 text-[.68rem] sm:inline-flex">
            <Activity size={15} /> Live demo
          </Link>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 text-[#d7e9cc] xl:hidden" onClick={() => setOpen((v) => !v)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-[#0e2018]/97 px-4 pb-6 pt-4 xl:hidden" aria-label="Mobile">
          <div className="grid grid-cols-2 gap-1.5">
            {routeLinks.map((link, index) => (
              <Link
                key={link.path}
                href={link.path}
                className={`interface rounded-xl px-3.5 py-3 text-[.66rem] font-bold uppercase tracking-[.07em] ${
                  isActive(link.path) ? "bg-[#b8f15a]/12 text-[#b8f15a]" : "bg-white/[.035] text-[#c9dcbf]"
                }`}
              >
                {link.path !== "/" && <span className="mr-1.5 text-[#d9a35c]">{String(index).padStart(2, "0")}</span>}
                {link.label}
              </Link>
            ))}
            <Link href="/demo" className="interface col-span-2 mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#b8f15a] px-3.5 py-3 text-[.66rem] font-extrabold uppercase tracking-[.07em] text-[#163024]">
              <Activity size={15} /> Open live demo
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
