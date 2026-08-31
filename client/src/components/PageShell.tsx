// Grinrex IoT — chapter page shell. Every chapter page gets the same operational frame:
// a numbered hero with an optional image band, the left signal trail, and prev/next paging.
import { useEffect, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";
import { chapters } from "@/content";

export function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);
  return null;
}

interface PageShellProps {
  chapterIndex: number; // index into chapters (0-based)
  eyebrow: string;
  title: ReactNode;
  copy?: string;
  image?: string;
  imageAlt?: string;
  children: ReactNode;
}

export function PageShell({ chapterIndex, eyebrow, title, copy, image, imageAlt, children }: PageShellProps) {
  const chapter = chapters[chapterIndex];
  const previous = chapters[chapterIndex - 1];
  const next = chapters[chapterIndex + 1];

  return (
    <div className="signal-page min-h-screen">
      <SiteNav />
      <main>
        {/* Chapter hero */}
        <section className="relative isolate overflow-hidden pb-10 pt-36 sm:pt-40 lg:pb-14">
          {image && (
            <>
              <img src={image} alt={imageAlt ?? ""} className="hero-image absolute inset-0 -z-20 h-full w-full object-cover" />
              <div className="scrim absolute inset-0 -z-10" />
            </>
          )}
          <div className={`${image ? "" : "root-grid"} absolute inset-0 -z-10 ${image ? "opacity-100" : "opacity-40"}`} />
          <div className="mx-auto max-w-[1520px] px-5 sm:px-8 lg:px-12">
            <div className="max-w-4xl">
              <div className="reveal eyebrow mb-6 flex items-center gap-3 text-[#b8f15a]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-current font-extrabold">{chapter.number}</span>
                {eyebrow}
              </div>
              <h1 className="reveal display text-5xl leading-[.95] text-[#f4ffe5] sm:text-6xl lg:text-7xl">{title}</h1>
              {copy && <p className="reveal-delay mt-6 max-w-2xl text-base leading-7 text-[#c9dcc0] sm:text-lg sm:leading-8">{copy}</p>}
            </div>
          </div>
        </section>

        {/* Chapter body with signal trail */}
        <section className="chapter-shell mx-auto max-w-[1520px] px-5 pb-24 pt-6 sm:px-8 lg:px-12 lg:pb-32">
          <div className="trail" aria-hidden="true" />
          {children}
        </section>

        {/* Prev / next paging */}
        <nav className="mx-auto max-w-[1520px] px-5 pb-20 sm:px-8 lg:px-12" aria-label="Chapter navigation">
          <div className="grid gap-4 border-t border-white/10 pt-10 sm:grid-cols-2">
            {previous ? (
              <Link href={previous.path} className="glass-panel group flex items-center gap-4 rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d9a35c]/50 text-[#d9a35c]"><ArrowLeft size={16} /></span>
                <span>
                  <span className="eyebrow block text-[#d9a35c]">Chapter {previous.number}</span>
                  <span className="mt-1 block font-bold text-[#effadf]">{previous.label}</span>
                </span>
              </Link>
            ) : (
              <Link href="/" className="glass-panel group flex items-center gap-4 rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d9a35c]/50 text-[#d9a35c]"><ArrowLeft size={16} /></span>
                <span>
                  <span className="eyebrow block text-[#d9a35c]">Back to</span>
                  <span className="mt-1 block font-bold text-[#effadf]">Home thesis</span>
                </span>
              </Link>
            )}
            {next ? (
              <Link href={next.path} className="glass-panel group flex items-center justify-between gap-4 rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5 sm:justify-end">
                <span className="text-right">
                  <span className="eyebrow block text-[#d9a35c]">Chapter {next.number}</span>
                  <span className="mt-1 block font-bold text-[#effadf]">{next.label}</span>
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#b8f15a]/50 text-[#b8f15a]"><ArrowRight size={16} /></span>
              </Link>
            ) : (
              <Link href="/demo" className="glass-panel group flex items-center justify-between gap-4 rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5 sm:justify-end">
                <span className="text-right">
                  <span className="eyebrow block text-[#b8f15a]">Finish here</span>
                  <span className="mt-1 block font-bold text-[#effadf]">Open the live demo</span>
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#b8f15a]/50 text-[#b8f15a]"><ArrowRight size={16} /></span>
              </Link>
            )}
          </div>
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
