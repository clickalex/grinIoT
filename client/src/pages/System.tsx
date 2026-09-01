// Grinrex IoT — Chapter 02: The Grinrex system.
import { ArrowRight, BrainCircuit, Gauge, Hand, History } from "lucide-react";
import { Link } from "wouter";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { operatingRules, systemLoop } from "@/content";

const loopDetails = [
  [Gauge, "Sense", "Capacitive soil moisture, ambient temperature and humidity, light, rainfall, tank level, and flow — collected on a continuous local schedule."],
  [BrainCircuit, "Decide", "The edge controller validates each reading, checks thresholds, weather context, and tank state, then forms a safe local decision. Connectivity is never required for the decision itself."],
  [Hand, "Act", "Pumps, solenoid valves, and optional equipment execute bounded actions. Every command carries a maximum duration, a stop path, and a normally safe fallback."],
  [History, "Learn", "Every measurement, decision, and event becomes a record. Water use, outcomes, and interventions accumulate into evidence for better rules and honest analytics."],
] as const;

export default function System() {
  return (
    <PageShell
      chapterIndex={1}
      eyebrow="The Grinrex system"
      title={<>Measure the garden.<br />Decide with <em className="font-normal text-[#d9a35c]">context.</em></>}
      copy="The system is organized as a reliable physical loop. Sensors collect the signal; the edge controller validates it; local rules protect the garden; the application turns actions and conditions into a useful record."
      image="/images/drip-irrigation.jpg"
      imageAlt="Close-up of a drip irrigation emitter watering seedlings"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {loopDetails.map(([Icon, title, text], index) => (
          <article className="glass-panel rounded-[1.5rem] p-7" key={title}>
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b8f15a] text-[#143021]"><Icon size={22} /></div>
              <span className="interface text-xs font-extrabold text-[#d9a35c]">Stage 0{index + 1}</span>
            </div>
            <h3 className="mt-7 text-2xl font-bold text-[#effadf]">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">{text}</p>
          </article>
        ))}
      </div>

      <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="image-frame min-h-[420px] rounded-[1.7rem] border border-white/10 shadow-2xl shadow-black/30">
          <img src="/images/vertical-garden.jpg" alt="Modular vertical garden with integrated irrigation" />
          <div className="absolute bottom-5 left-5 right-5 glass-panel rounded-2xl p-4">
            <div className="eyebrow text-[#b8f15a]">Designed to expand</div>
            <p className="mt-1 text-sm leading-6 text-[#ebf9db]">Additional sensors and valves add capacity without changing the garden’s core operating logic.</p>
          </div>
        </div>
        <div>
          <SectionHeader index="02" eyebrow="Why a loop, not a list" title={<>Reliability is a<br /><em className="font-normal text-[#b8f15a]">sequence.</em></>} copy="Grinrex keeps each stage of the loop distinct so that a failure in one stage is contained, observable, and repairable — instead of silently corrupting the whole garden routine." />
          <div className="mt-9 space-y-3">
            {systemLoop.map(([number, title, text]) => (
              <div className="flex gap-4 border-b border-white/10 pb-3" key={number}>
                <span className="interface pt-0.5 text-xs font-extrabold text-[#b8f15a]">{number}</span>
                <div><span className="font-semibold text-[#f1fadc]">{title}</span><span className="ml-2 text-sm text-[#a9c1a2]">{text}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-20 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.4rem] border border-[#d9a35c]/25 bg-[#332b1c] p-7 sm:p-9">
          <div className="eyebrow text-[#d9a35c]">Data and physical rules</div>
          <div className="mt-6 space-y-5">
            {operatingRules.map(([title, text]) => (
              <div key={title}>
                <h3 className="font-bold text-[#f7e7c6]">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#d6c8aa]">{text}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[1.4rem] border border-[#b8f15a]/20 bg-[#183929] p-7 sm:p-9">
          <div className="eyebrow text-[#b8f15a]">Local first, connected second</div>
          <p className="mt-5 text-lg leading-8 text-[#e4f2d9]">Core thresholds, safety cutoffs, and the emergency stop live on the controller beside the garden. The cloud adds visibility, records, analytics, and remote control — but basic plant care never depends on a connection surviving.</p>
          <div className="metric-line mt-7 grid grid-cols-2 gap-4 pt-5">
            <div><div className="interface text-xl font-extrabold text-[#b8f15a]">Offline-safe</div><div className="mt-1 text-xs text-[#b8cdb2]">Rules run on the edge</div></div>
            <div><div className="interface text-xl font-extrabold text-[#b8f15a]">1 tap</div><div className="mt-1 text-xs text-[#b8cdb2]">Emergency stop</div></div>
          </div>
        </article>
      </div>

      <div className="mt-20 flex flex-col gap-6 rounded-[1.6rem] border border-[#b8f15a]/20 bg-[#163425] p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="eyebrow text-[#b8f15a]">See it running</div>
          <p className="mt-4 text-lg leading-8 text-[#e2efd8]">The live demo runs this exact loop: sensors decay, rules open valves, the tank drains, rain pauses the system, and every event is logged.</p>
        </div>
        <Link href="/demo" className="cta-button cta-primary shrink-0">Open the live loop <ArrowRight size={15} /></Link>
      </div>
    </PageShell>
  );
}
