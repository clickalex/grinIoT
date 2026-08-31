// Grinrex IoT — Chapter 08: Investor view.
import { ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { investorPoints, validationSignals } from "@/content";

export default function Investor() {
  return (
    <PageShell
      chapterIndex={7}
      eyebrow="Investor view"
      title={<>An investment story<br />grounded in <em className="font-normal text-[#b8f15a]">execution.</em></>}
      copy="The core bet is not a list of sensors. It is a disciplined system that turns practical garden control into an installed base for modules, service, analytics, and commercial installations."
    >
      <div className="grid gap-12 lg:grid-cols-[.84fr_1.16fr] lg:items-end">
        <SectionHeader index="08" eyebrow="Three theses" title={<>Discipline is the<br /><em className="font-normal text-[#d9a35c]">moat.</em></>} copy="Anyone can list features. The defensible position is the sequence: a hardware wedge that works without a subscription, expansion economics on one operating base, and reliability before AI." />
        <div className="grid gap-4 md:grid-cols-3">
          {investorPoints.map(([title, text], index) => (
            <article className="rounded-[1.35rem] border border-[#b8f15a]/20 bg-[#173426] p-5" key={title}>
              <span className="interface text-xs font-extrabold text-[#d9a35c]">0{index + 1}</span>
              <h3 className="mt-8 text-lg font-bold text-[#effadf]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#afc6a8]">{text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-16 grid overflow-hidden rounded-[1.7rem] border border-white/10 lg:grid-cols-[1.1fr_.9fr]">
        <div className="bg-[#dff4ba] p-7 sm:p-10">
          <div className="eyebrow text-[#56752e]">Packaging concept</div>
          <h3 className="display mt-4 text-4xl leading-none text-[#1a3928]">Hardware first.<br />Value compounds through expansion.</h3>
          <p className="mt-6 max-w-xl leading-7 text-[#48604c]">Starter solves a small balcony use case. Pro extends into multi-zone water intelligence. Elite becomes an installation-led offer for vertical gardens, small farms, schools, restaurants, offices, and property developments.</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {["Hardware kits", "Expansion zones", "Installations", "Maintenance", "Water analytics", "Decision support"].map((tag) => (
              <span key={tag} className="interface rounded-full border border-[#7ba64b]/40 px-3 py-1.5 text-[.66rem] font-extrabold uppercase tracking-[.08em] text-[#3a5b32]">{tag}</span>
            ))}
          </div>
        </div>
        <div className="bg-[#173426] p-7 sm:p-10">
          <div className="eyebrow text-[#b8f15a]">Evidence to earn next</div>
          <div className="mt-6 space-y-4">
            {validationSignals.map((item) => (
              <div className="flex gap-3 text-sm leading-6 text-[#d7e9cc]" key={item}>
                <Check className="mt-1 shrink-0 text-[#b8f15a]" size={15} />{item}
              </div>
            ))}
          </div>
          <div className="metric-line mt-7 pt-5">
            <div className="eyebrow text-[#d9a35c]">Sequence discipline</div>
            <p className="mt-2 text-sm leading-6 text-[#afc6a8]">Reliability and outdoor proof come before high-risk AI, chemical dosing, and complex mechanical systems. Each funding milestone should track a physical evidence gate, not a feature count.</p>
          </div>
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-6 rounded-[1.6rem] border border-[#b8f15a]/20 bg-[#163425] p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="eyebrow text-[#b8f15a]">The controlled-circulation record</div>
          <p className="mt-4 text-lg leading-8 text-[#e2efd8]">The full investment brief — opportunity, wedge logic, commercial progression, and validation gates — lives in the document library, ready to read or export.</p>
        </div>
        <Link href="/documents" className="cta-button cta-primary shrink-0">Open the document library <ArrowRight size={15} /></Link>
      </div>
    </PageShell>
  );
}
