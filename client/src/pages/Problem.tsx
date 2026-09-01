// Grinrex IoT — Chapter 01: The growing problem.
import { ArrowRight, Droplets, EyeOff, ThermometerSun, Timer, TriangleAlert, Waves } from "lucide-react";
import { Link } from "wouter";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { problemCosts, problemSignals } from "@/content";

const failureModes = [
  [Timer, "Inconsistent watering", "Routines drift with schedules, weather, and memory. Plants receive too much, too little, or nothing at all."],
  [EyeOff, "Invisible soil conditions", "Moisture below the surface is guessed, not measured. Overwatering and drought look identical from above."],
  [Droplets, "Empty tanks, silent failure", "Storage runs dry between visits. A pump cycling an empty tank fails quietly — usually while nobody is home."],
  [ThermometerSun, "Heat rewrites the plan", "A rooftop at 38°C and a shaded balcony at 26°C are different worlds. One generic schedule serves neither."],
  [Waves, "Vertical gardens dry unevenly", "Upper levels drain fast, lower levels stay wet. Per-level differences compound without per-level measurement."],
  [TriangleAlert, "No remote awareness", "Owners cannot see a wilting zone, a leaking valve, or an overheating pump while they are away."],
] as const;

export default function Problem() {
  return (
    <PageShell
      chapterIndex={0}
      eyebrow="The growing problem"
      title={<>Urban growing needs an<br /><em className="font-normal text-[#b8f15a]">operating system.</em></>}
      copy="Balconies, rooftops, terraces, and vertical gardens face the same compounding issue: care is still managed as manual guesswork in conditions that are neither stable nor simple."
      image="/images/balcony-garden.jpg"
      imageAlt="Urban balcony garden with potted plants and a small water tank"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problemSignals.map((point, index) => (
          <div className="data-card" key={point}>
            <div className="eyebrow text-[#d9a35c]">Signal 0{index + 1}</div>
            <p className="mt-3 text-base leading-6 text-[#e3f1d5]">{point}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
        <SectionHeader index="01" eyebrow="Failure modes" title={<>Six ways a garden<br /><em className="font-normal text-[#d9a35c]">fails silently.</em></>} copy="The problem is not a lack of effort — it is a lack of signal. Each failure mode below is a measurement problem that an operating loop can watch continuously." />
        <div className="space-y-3">
          {failureModes.map(([Icon, title, text], index) => (
            <article className="glass-panel grid gap-4 rounded-2xl p-5 sm:grid-cols-[52px_1fr]" key={title}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b8f15a]/14 text-[#b8f15a]"><Icon size={21} /></div>
              <div>
                <h3 className="text-lg font-bold text-[#effadf]"><span className="interface mr-2 text-xs font-extrabold text-[#d9a35c]">0{index + 1}</span>{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#afc5a7]">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-20 grid gap-4 lg:grid-cols-[.95fr_1.05fr]">
        <article className="rounded-[1.5rem] border border-[#d9a35c]/25 bg-[#332b1c] p-7 sm:p-9">
          <div className="eyebrow text-[#d9a35c]">Manual routine today</div>
          <p className="mt-5 text-base leading-7 text-[#d6c8aa]">Check by eye, water by habit, refill when the can is empty. Knowledge lives in one person’s memory; the garden is blind whenever that person is away. One missed check during a heat wave can undo months of growing.</p>
        </article>
        <article className="rounded-[1.5rem] border border-[#b8f15a]/25 bg-[#183929] p-7 sm:p-9">
          <div className="eyebrow text-[#b8f15a]">Measured loop tomorrow</div>
          <p className="mt-5 text-base leading-7 text-[#e4f2d9]">Sensors report soil, climate, and tank state continuously. Local rules water exactly when needed, pause in rain, and stop at safe limits. The owner sees the record — and intervenes with one tap, from anywhere.</p>
        </article>
      </div>

      <div className="mt-20 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {problemCosts.map(([title, text], index) => (
          <article className="glass-panel rounded-[1.4rem] p-6" key={title}>
            <span className="interface text-xs font-extrabold text-[#d9a35c]">Cost 0{index + 1}</span>
            <h3 className="mt-6 text-xl font-bold text-[#effadf]">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">{text}</p>
          </article>
        ))}
      </div>

      <div className="mt-20 rounded-[1.6rem] border border-[#b8f15a]/20 bg-[#163425] p-8 sm:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="eyebrow text-[#b8f15a]">The answer is a loop, not a gadget</div>
            <p className="mt-4 text-lg leading-8 text-[#e2efd8]">A single sensor or timer does not solve this problem. The fix is an operating loop: measure, decide with local rules, act safely, and keep a readable record. That loop is the Grinrex system.</p>
          </div>
          <Link href="/system" className="cta-button cta-primary shrink-0">Meet the system <ArrowRight size={15} /></Link>
        </div>
      </div>
    </PageShell>
  );
}
