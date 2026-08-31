// Grinrex IoT — Chapter 05: Execution sequence.
import { ArrowRight, Flag } from "lucide-react";
import { Link } from "wouter";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { roadmaps } from "@/content";

const exitConditions = [
  ["01", "Safe, repeatable irrigation in real gardens — the core loop survives weather, power events, and lost connectivity."],
  ["02", "A clear water baseline per zone and a visible reduction in unnecessary watering."],
  ["03", "Reliable operation across varied garden layouts without support burden rising disproportionately."],
  ["04", "Explained recommendations with measurable adoption — and no automation beyond what pilots trust."],
  ["05", "Commercial readiness: production hardware, enclosure, app, cloud, subscriptions, and quality testing."],
] as const;

export default function Roadmap() {
  return (
    <PageShell
      chapterIndex={4}
      eyebrow="Execution sequence"
      title={<>Prove reliability.<br />Then add <em className="font-normal text-[#d9a35c]">intelligence.</em></>}
      copy="The complete seven-phase source roadmap keeps advanced automation behind the evidence that matters: safe outdoor operation, reliable data, and a system that users choose to keep running."
    >
      <div className="grid gap-12 lg:grid-cols-[.88fr_1.12fr]">
        <SectionHeader index="05" eyebrow="Seven phases" title={<>Each stage has an<br /><em className="font-normal text-[#b8f15a]">exit condition.</em></>} copy="Phases are not feature lists — they are sequences with a measurable proof point. The project does not advance until the current proof is in hand." />
        <div className="relative space-y-4">
          <div className="absolute bottom-8 left-[22px] top-8 w-px bg-gradient-to-b from-[#b8f15a] via-[#d9a35c] to-transparent" />
          {roadmaps.map(([number, title, text]) => (
            <article className="relative ml-0 grid grid-cols-[46px_1fr] gap-5" key={number}>
              <div className="interface z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#b8f15a]/70 bg-[#143021] text-xs font-extrabold text-[#b8f15a]">{number}</div>
              <div className="glass-panel rounded-2xl p-5">
                <h3 className="text-xl font-bold text-[#f0fbdc]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#aec4a6]">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-20 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {exitConditions.map(([number, text]) => (
          <article className="rounded-[1.35rem] border border-[#d9a35c]/25 bg-[#332b1c] p-6" key={number}>
            <div className="eyebrow flex items-center gap-2 text-[#d9a35c]"><Flag size={13} /> Exit {number}</div>
            <p className="mt-4 text-sm leading-6 text-[#d6c8aa]">{text}</p>
          </article>
        ))}
        <article className="rounded-[1.35rem] border border-[#b8f15a]/25 bg-[#183929] p-6">
          <div className="eyebrow flex items-center gap-2 text-[#b8f15a]"><Flag size={13} /> Sequencing rule</div>
          <p className="mt-4 text-sm leading-6 text-[#e4f2d9]">Reliability before intelligence, intelligence before chemical and mechanical complexity, pilots before scale. Every module must earn its place through evidence, not enthusiasm.</p>
        </article>
      </div>

      <div className="mt-20 flex flex-col gap-6 rounded-[1.6rem] border border-[#b8f15a]/20 bg-[#163425] p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="eyebrow text-[#b8f15a]">The guardrails that protect the sequence</div>
          <p className="mt-4 text-lg leading-8 text-[#e2efd8]">Scope containment, safe physical control, outdoor durability, and commercial discipline keep the roadmap honest.</p>
        </div>
        <Link href="/safety" className="cta-button cta-primary shrink-0">Read the guardrails <ArrowRight size={15} /></Link>
      </div>
    </PageShell>
  );
}
