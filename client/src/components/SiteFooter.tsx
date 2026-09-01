// Grinrex IoT — shared footer with chapter links and demo access.
import { Activity, ArrowUp } from "lucide-react";
import { Link } from "wouter";
import { BrandMark } from "./BrandMark";
import { chapters } from "@/content";
import { demoGroups, demoHref, demoSections } from "@/demo/sections";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0d1e15] px-5 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1520px]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <BrandMark size={38} />
              <span className="interface text-base font-extrabold tracking-[.12em] text-[#efffd3]">
                GRINREX<span className="text-[#b8f15a]">/</span>IOT
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#a8c1a0]">A modular, water-intelligent operating system for urban gardens. Built to move from real garden signals to measurable outcomes — locally safe before remotely clever.</p>
            <Link href="/demo" className="cta-button cta-primary mt-6">
              <Activity size={15} /> Try the live demo
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="eyebrow text-[#d9a35c]">Chapters</div>
              <ul className="mt-4 space-y-2.5">
                {chapters.slice(0, 5).map(chapter => (
                  <li key={chapter.id}>
                    <Link href={chapter.path} className="interface text-xs font-bold uppercase tracking-[.06em] nav-link">
                      <span className="mr-1.5 text-[#d9a35c]">{chapter.number}</span>
                      {chapter.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow text-[#d9a35c]">More</div>
              <ul className="mt-4 space-y-2.5">
                {chapters.slice(5).map(chapter => (
                  <li key={chapter.id}>
                    <Link href={chapter.path} className="interface text-xs font-bold uppercase tracking-[.06em] nav-link">
                      <span className="mr-1.5 text-[#d9a35c]">{chapter.number}</span>
                      {chapter.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2">
              <div className="eyebrow text-[#b8f15a]">Working demo — {demoSections.length} pages, one simulation</div>
              <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-3">
                {demoGroups.map(group => (
                  <div key={group.id}>
                    <div className="interface text-[.55rem] font-extrabold uppercase tracking-[.16em] text-[#7e9a80]">{group.label}</div>
                    <ul className="mt-2.5 space-y-2">
                      {group.sections.map(section => (
                        <li key={section.path}>
                          <Link href={demoHref(section.path)} className="interface text-xs font-bold uppercase tracking-[.06em] nav-link">
                            {section.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-[#7e9a80] sm:flex-row sm:items-center sm:justify-between">
          <p className="interface tracking-[.06em]">© 2026 GRINREX IOT — CONCEPT / PROTOTYPE-PLANNING RECORD. EVERY DROP HAS A DESTINATION.</p>
          <button className="interface inline-flex items-center gap-2 font-bold uppercase tracking-[.06em] nav-link" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <ArrowUp size={13} /> Return to top
          </button>
        </div>
      </div>
    </footer>
  );
}
