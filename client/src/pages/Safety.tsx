// Grinrex IoT — Chapter 06: Launch guardrails.
import { ArrowRight, OctagonX, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { guardrails, safetyControls } from "@/content";

export default function Safety() {
  return (
    <PageShell
      chapterIndex={5}
      eyebrow="Launch guardrails"
      title={<>A smart garden must be<br /><em className="font-normal text-[#d9a35c]">safe before clever.</em></>}
      copy="The project’s largest risk is attempting too much before the core physical loop is proven. These controls keep the product focused, testable, and commercially honest."
    >
      <div className="grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
        <SectionHeader index="06" eyebrow="Risk register" title={<>Four controls hold<br /><em className="font-normal text-[#d9a35c]">the line.</em></>} copy="Each guardrail names a failure mode and the discipline that prevents it. They are reviewed at every release gate, not filed once." />
        <div className="space-y-3">
          {guardrails.map(([level, title, text], index) => (
            <article className="glass-panel grid gap-4 rounded-2xl p-5 sm:grid-cols-[86px_1fr]" key={title}>
              <div className={`interface flex h-fit items-center gap-2 rounded-full px-3 py-2 text-[.6rem] font-extrabold uppercase tracking-[.1em] ${index < 2 ? "bg-[#66431f] text-[#ffd49c]" : "bg-[#294836] text-[#b8f15a]"}`}>
                <TriangleAlert size={12} />{level}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#effadf]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#afc5a7]">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {safetyControls.map(([title, text], index) => (
          <article className="rounded-[1.35rem] border border-[#b8f15a]/20 bg-[#173426] p-6" key={title}>
            <div className="flex items-center justify-between">
              <span className="interface text-xs font-extrabold text-[#d9a35c]">Control 0{index + 1}</span>
              <ShieldCheck size={17} className="text-[#b8f15a]" />
            </div>
            <h3 className="mt-6 text-lg font-bold text-[#effadf]">{title}</h3>
            <p className="mt-2.5 text-sm leading-6 text-[#afc6a8]">{text}</p>
          </article>
        ))}
        <article className="rounded-[1.35rem] border border-[#b8f15a]/20 bg-[#173426] p-6">
          <div className="flex items-center justify-between">
            <span className="interface text-xs font-extrabold text-[#d9a35c]">Control 06</span>
            <OctagonX size={17} className="text-[#b8f15a]" />
          </div>
          <h3 className="mt-6 text-lg font-bold text-[#effadf]">Failure rehearsal</h3>
          <p className="mt-2.5 text-sm leading-6 text-[#afc6a8]">Stuck valves, dry pumps, sensor faults, and power loss are tested on the bench before pilots — a system proves its fallbacks by exercising them.</p>
        </article>
      </div>

      <div className="mt-20 rounded-[1.45rem] border border-[#b8f15a]/20 bg-[#163425] p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="eyebrow flex items-center gap-2 text-[#b8f15a]"><ShieldAlert size={15} /> MVP decision</div>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-[#e2efd8]">Launch a garden water-control kit, not an all-in-one urban-farming platform. Every later module must earn its place through reliable pilot evidence, user value, and a clear service model.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/documents" className="cta-button cta-primary shrink-0">Read safeguards <ArrowRight size={15} /></Link>
            <Link href="/demo/irrigation" className="cta-button cta-secondary shrink-0">Try the emergency stop</Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
