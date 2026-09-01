// Grinrex IoT — Chapter 03: Complete capability atlas.
import { ArrowRight, Layers } from "lucide-react";
import { Link } from "wouter";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { featureModules } from "@/content";

export default function Capabilities() {
  return (
    <PageShell
      chapterIndex={2}
      eyebrow="Complete capability atlas"
      title={<>One garden loop.<br />A <em className="font-normal text-[#b8f15a]">complete</em> system.</>}
      copy="Every source module is preserved here in operating order: sensing and water control establish the base; observation, intelligence, and advanced automation expand only when the garden evidence supports them."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {featureModules.map(([Icon, title, text], index) => (
          <article className="glass-panel group rounded-[1.4rem] p-6 transition-transform duration-300 hover:-translate-y-1" key={title}>
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b8f15a] text-[#143021]"><Icon size={21} /></div>
              <span className="interface text-xs font-extrabold text-[#d9a35c]">0{index + 1}</span>
            </div>
            <h3 className="mt-7 text-xl font-bold text-[#effadf]">{title}</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#afc5a7]">{text}</p>
          </article>
        ))}
      </div>

      <div className="mt-20 grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <SectionHeader index="03" eyebrow="Expansion discipline" title={<>Modules earn their<br /><em className="font-normal text-[#d9a35c]">place.</em></>} copy="Not everything ships at once. The atlas is the ceiling; the roadmap is the floor. Each module enters the product only after the base loop proves reliable in real gardens." />
        <div className="space-y-3">
          {[
            ["Core now", "Sensing, water control, tank protection, local rules, dashboard — the MVP water-control kit."],
            ["Early expansion", "Flow metering, rainwater reuse, weather context, vertical-zone nodes, and water analytics."],
            ["Evidence-gated", "Predictive watering and advisory visual insight — only after reliable data exists."],
            ["Deliberately later", "Fertilizer dosing, shade/cooling automation, camera AI, LoRa/cellular, and multi-property workflows."],
          ].map(([title, text], index) => (
            <article className="glass-panel flex gap-5 rounded-2xl p-5" key={title}>
              <span className="interface flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#b8f15a]/70 bg-[#143021] text-xs font-extrabold text-[#b8f15a]">0{index + 1}</span>
              <div>
                <h3 className="text-lg font-bold text-[#effadf]">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#afc5a7]">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-20 flex flex-col gap-6 rounded-[1.6rem] border border-[#b8f15a]/20 bg-[#163425] p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#b8f15a] text-[#143021]"><Layers size={22} /></div>
          <div className="max-w-2xl">
            <div className="eyebrow text-[#b8f15a]">How it all connects</div>
            <p className="mt-3 text-lg leading-8 text-[#e2efd8]">The seven-layer platform architecture shows where each capability lives — sensing, control, communication, records, intelligence, application, and actuation.</p>
          </div>
        </div>
        <Link href="/platform" className="cta-button cta-primary shrink-0">Read the architecture <ArrowRight size={15} /></Link>
      </div>
    </PageShell>
  );
}
