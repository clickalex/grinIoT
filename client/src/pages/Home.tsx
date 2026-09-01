// Grinrex IoT — Home. The opening thesis plus a compressed tour of every chapter,
// with a direct path into the working demo.
import { Activity, ArrowDown, ArrowRight, BookOpenText, Check, Droplets, ShieldCheck, SlidersHorizontal, Sprout, Waves, Zap } from "lucide-react";
import { Link } from "wouter";
import { BrandMark } from "@/components/BrandMark";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { SectionHeader } from "@/components/SectionHeader";
import { chapters, commercialItems, featureModules, problemSignals, systemLoop } from "@/content";
import { usePageMeta } from "@/hooks/usePageMeta";

function DemoCta({ large = false }: { large?: boolean }) {
  return (
    <Link href="/demo" className={`cta-button cta-primary ${large ? "!px-8 !py-4 text-sm" : ""}`}>
      <Activity size={16} /> Open live demo
    </Link>
  );
}

export default function Home() {
  usePageMeta(
    "Grinrex IoT — Every drop has a destination.",
    "Grinrex IoT is the modular, water-intelligent operating system for urban gardens. Explore the system, the documents, and a working live demo."
  );
  return (
    <div id="top" className="signal-page min-h-screen">
      <SiteNav />
      <main>
        {/* Hero */}
        <section className="relative isolate flex min-h-[760px] items-end overflow-hidden pt-20 lg:min-h-screen">
          <img src="/images/hero-rooftop-garden.jpg" alt="Irrigated rooftop garden in an urban setting" className="hero-image absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="scrim absolute inset-0 -z-10" />
          <div className="root-grid absolute inset-0 -z-10 opacity-40" />
          <div className="hero-mark" aria-hidden="true">
            <BrandMark size={132} />
            <div className="interface mt-3 text-[.62rem] font-extrabold tracking-[.2em] text-[#d9a35c]">LOCAL / MEASURED / SAFE</div>
          </div>
          <div className="mx-auto grid w-full max-w-[1520px] gap-10 px-5 pb-16 pt-20 sm:px-8 lg:grid-cols-[1.2fr_.8fr] lg:px-12 lg:pb-20">
            <div className="max-w-4xl">
              <div className="reveal eyebrow mb-7 flex items-center gap-3 text-[#b8f15a]"><span className="pulse-dot h-2 w-2 rounded-full bg-[#b8f15a]" /> System brief / 2026</div>
              <h1 className="reveal display max-w-4xl text-5xl leading-[.92] text-[#f4ffe5] sm:text-7xl lg:text-[clamp(4.8rem,7.7vw,8.9rem)]">Every drop has<br /><em className="font-normal text-[#b8f15a]">a destination.</em></h1>
              <p className="reveal-delay mt-7 max-w-xl text-lg leading-8 text-[#d2e4c8] sm:text-xl">Grinrex IoT is the modular, water-intelligent operating system for urban gardens—designed to make plant care measurable, local, and safely automated.</p>
              <div className="reveal-delay mt-9 flex flex-wrap gap-3">
                <Link href="/system" className="cta-button cta-primary">Follow the system <ArrowDown size={15} /></Link>
                <Link href="/investor" className="cta-button cta-secondary">Read the investor case <ArrowRight size={15} /></Link>
                <DemoCta />
              </div>
            </div>
            <div className="self-end lg:justify-self-end lg:pb-4">
              <div className="glass-panel signal-glow max-w-sm rounded-[1.5rem] p-5">
                <div className="eyebrow text-[#d9a35c]">The operating thesis</div>
                <p className="mt-3 text-[1.02rem] leading-7 text-[#eefadb]">Connect measured garden conditions to safe irrigation, then expand from clear evidence—not feature volume.</p>
                <div className="metric-line mt-5 grid grid-cols-2 gap-3 pt-4 text-sm">
                  <div><div className="interface text-xl font-extrabold text-[#b8f15a]">1–4</div><div className="mt-1 text-xs text-[#b8cdb2]">MVP zones</div></div>
                  <div><div className="interface text-xl font-extrabold text-[#b8f15a]">Local</div><div className="mt-1 text-xs text-[#b8cdb2]">Safety first</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chapter index strip */}
        <section className="border-y border-white/10 bg-[#0d1e15]/70">
          <div className="demo-scroll mx-auto flex max-w-[1520px] items-center gap-1 overflow-x-auto px-5 py-3 sm:px-8 lg:px-12">
            <span className="interface mr-2 shrink-0 text-[.56rem] font-extrabold tracking-[.16em] text-[#d9a35c]">ROUTE</span>
            {chapters.map((chapter) => (
              <Link key={chapter.id} href={chapter.path} className="interface shrink-0 rounded-full px-3 py-2 text-[.6rem] font-bold uppercase tracking-[.07em] nav-link hover:bg-white/[.04]">
                <span className="mr-1 text-[#d9a35c]">{chapter.number}</span>{chapter.label}
              </Link>
            ))}
            <Link href="/demo" className="interface ml-2 shrink-0 rounded-full bg-[#b8f15a]/14 px-3 py-2 text-[.6rem] font-extrabold uppercase tracking-[.07em] text-[#b8f15a]">● Live demo</Link>
          </div>
        </section>

        {/* Problem preview */}
        <section className="chapter-shell mx-auto max-w-[1520px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="trail" aria-hidden="true" />
          <div className="grid gap-16 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <SectionHeader index="01" eyebrow="The growing problem" title={<>Urban growing needs an<br /><em className="font-normal text-[#b8f15a]">operating system.</em></>} copy="Balconies, rooftops, terraces, and vertical gardens face the same compounding issue: care is still managed as manual guesswork in conditions that are neither stable nor simple." />
            <div className="grid gap-4 sm:grid-cols-2">
              {problemSignals.map((point, index) => (
                <div className="data-card" key={point}><div className="eyebrow text-[#d9a35c]">Signal 0{index + 1}</div><p className="mt-3 text-base leading-6 text-[#e3f1d5]">{point}</p></div>
              ))}
              <Link href="/problem" className="glass-panel group flex items-center justify-between rounded-[1.15rem] p-5 transition-transform duration-300 hover:-translate-y-0.5">
                <span className="font-bold text-[#effadf]">Inspect the full problem record</span>
                <ArrowRight size={17} className="text-[#b8f15a]" />
              </Link>
            </div>
          </div>
        </section>

        {/* System loop preview */}
        <section className="relative overflow-hidden border-y border-white/10 bg-[#0d1e15]">
          <div className="absolute inset-0 opacity-40"><img src="/images/drip-irrigation.jpg" alt="Drip irrigation in a garden bed" className="h-full w-full object-cover object-center" /></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1e15] via-[#0d1e15]/90 to-[#0d1e15]/55" />
          <div className="relative mx-auto grid max-w-[1520px] gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-12 lg:py-32">
            <SectionHeader index="02" eyebrow="The Grinrex loop" title={<>Measure the garden.<br />Decide with <em className="font-normal text-[#d9a35c]">context.</em></>} copy="Sensors collect the signal; the edge controller validates it; local rules protect the garden; the application turns actions and conditions into a useful record." />
            <div className="space-y-3">
              {systemLoop.map(([number, title, text]) => (
                <div className="glass-panel flex gap-4 rounded-2xl p-5" key={number}>
                  <span className="interface pt-0.5 text-xs font-extrabold text-[#b8f15a]">{number}</span>
                  <div><span className="font-semibold text-[#f1fadc]">{title}</span><span className="ml-2 text-sm text-[#a9c1a2]">{text}</span></div>
                </div>
              ))}
              <Link href="/system" className="cta-button cta-secondary mt-2">Read the system chapter <ArrowRight size={15} /></Link>
            </div>
          </div>
        </section>

        {/* Capabilities preview */}
        <section className="chapter-shell root-grid mx-auto max-w-[1520px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="trail" aria-hidden="true" />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader index="03" eyebrow="Capability atlas" title={<>One garden loop.<br />A <em className="font-normal text-[#b8f15a]">complete</em> system.</>} copy="Sensing and water control establish the base; observation, intelligence, and advanced automation expand only when garden evidence supports them." />
            <Link href="/capabilities" className="cta-button cta-secondary shrink-0">All 14 modules <ArrowRight size={15} /></Link>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureModules.slice(0, 8).map(([Icon, title, text], index) => (
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
        </section>

        {/* Safety principle band */}
        <section className="relative overflow-hidden bg-[#0d1e15] py-24 lg:py-32">
          <div className="absolute inset-0 opacity-55"><img src="/images/vertical-garden.jpg" alt="Modular vertical garden with integrated irrigation" className="h-full w-full object-cover object-center" /></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1e15] via-[#0d1e15]/88 to-[#0d1e15]/40" />
          <div className="relative chapter-shell mx-auto max-w-[1520px] px-5 sm:px-8 lg:px-12">
            <div className="trail" aria-hidden="true" />
            <div className="max-w-4xl">
              <div className="eyebrow flex items-center gap-2 text-[#b8f15a]"><ShieldCheck size={16} /> Non-negotiable principle</div>
              <blockquote className="display mt-7 text-4xl leading-[1.02] text-[#f1fcdf] sm:text-6xl">“Critical systems must remain <em className="font-normal text-[#b8f15a]">locally safe</em> before they become remotely clever.”</blockquote>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#c3d4bb]">Core thresholds and emergency stops stay close to the garden. The cloud improves visibility; it should never become a prerequisite for basic plant care.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/safety" className="cta-button cta-secondary">Launch guardrails <ArrowRight size={15} /></Link>
                <Link href="/demo" className="cta-button cta-primary"><Activity size={15} /> See safety controls working</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Commercial preview */}
        <section className="chapter-shell mx-auto max-w-[1520px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="trail" aria-hidden="true" />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader index="07" eyebrow="Commercial system" title={<>From balcony kit<br />to <em className="font-normal text-[#b8f15a]">urban infrastructure.</em></>} copy="A staged offering across households, growers, hospitality, education, offices, nurseries, developers, and community gardens—matching product complexity to a clear installation and support model." />
            <Link href="/commercial" className="cta-button cta-secondary shrink-0">Full commercial chapter <ArrowRight size={15} /></Link>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {commercialItems.map(([tier, target, text], index) => (
              <article className="glass-panel rounded-[1.5rem] p-6" key={tier}>
                <div className="interface text-xs font-extrabold text-[#d9a35c]">0{index + 1} / {tier}</div>
                <h3 className="mt-7 text-2xl font-bold text-[#effadf]">{target}</h3>
                <p className="mt-3 text-sm leading-6 text-[#afc5a7]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Demo + documents closing */}
        <section className="border-t border-white/10 bg-[#0d1e15]">
          <div className="mx-auto grid max-w-[1520px] gap-6 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-32">
            <article className="relative overflow-hidden rounded-[1.7rem] border border-[#b8f15a]/25 bg-[#143021] p-8 sm:p-10">
              <div className="root-grid absolute inset-0 opacity-60" />
              <div className="relative">
                <div className="eyebrow flex items-center gap-2 text-[#b8f15a]"><Activity size={15} /> Working demo</div>
                <h2 className="display mt-5 text-4xl leading-[1.02] text-[#f1fcdf] sm:text-5xl">Watch the loop<br /><em className="font-normal text-[#b8f15a]">run live.</em></h2>
                <p className="mt-5 max-w-md text-base leading-7 text-[#bcd0b4]">A simulated garden on an accelerated clock: fourteen pages, one shared state. Weather, soil decay, the rule engine, harvesting, dosing, devices, camera review, and the event log all read and write the same loop. Every control on every demo page is real.</p>
                <ul className="mt-6 space-y-2.5">
                  {["Live dashboard with zones and valves", "Emergency stop, tank-low cutoff, cycle limits", "Watering windows and dry-run preview", "Device fleet: battery, radio, faults, OTA", "Rain harvest, dosing, camera review, tasks", "Water analytics with savings estimate"].map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-[#d7e9cc]"><Check className="mt-1 shrink-0 text-[#b8f15a]" size={15} />{item}</li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <DemoCta large />
                  <Link href="/demo/irrigation" className="cta-button cta-secondary"><Droplets size={15} /> Irrigation console</Link>
                  <Link href="/demo/rules" className="cta-button cta-secondary"><SlidersHorizontal size={15} /> Rules &amp; schedules</Link>
                </div>
              </div>
            </article>
            <article className="rounded-[1.7rem] border border-white/10 bg-[#173426] p-8 sm:p-10">
              <div className="eyebrow flex items-center gap-2 text-[#d9a35c]"><BookOpenText size={15} /> Product requirements</div>
              <h2 className="display mt-5 text-4xl leading-[1.02] text-[#f1fcdf] sm:text-5xl">One page.<br /><em className="font-normal text-[#d9a35c]">The complete PRD.</em></h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#bcd0b4]">Vision, problem, personas, architecture, the full 14-module feature atlas, user flows, hardware, safety, security, commercial model, roadmap, metrics, and the cons &amp; solutions audit — consolidated into a single product requirements document, exportable as Markdown.</p>
              <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
                {[["Vision & goals", "01–02"], ["Problem & market", "03–04"], ["Concept & architecture", "05–06"], ["Features & flows", "07–08"], ["Hardware & safety", "09–10"], ["Security & compliance", "11"], ["Commercial & roadmap", "13–14"], ["Risks & cons", "16"]].map(([label, number]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.035] px-4 py-3">
                    <span className="interface text-[.62rem] font-extrabold uppercase tracking-[.06em] text-[#d7e9cc]">{label}</span>
                    <span className="interface text-xs font-extrabold text-[#d9a35c]">{number}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/documents" className="cta-button cta-primary">Read the PRD <ArrowRight size={15} /></Link>
                <Link href="/roadmap" className="cta-button cta-secondary"><Zap size={15} /> Delivery roadmap</Link>
              </div>
            </article>
          </div>
        </section>

        {/* Closing band */}
        <section className="chapter-shell mx-auto max-w-[1520px] px-5 py-24 sm:px-8 lg:px-12">
          <div className="trail" aria-hidden="true" />
          <div className="max-w-3xl">
            <div className="eyebrow flex items-center gap-2 text-[#b8f15a]"><Sprout size={15} /> Closing thesis</div>
            <h2 className="display mt-6 text-4xl leading-[1.02] text-[#f1fcdf] sm:text-6xl">Follow the signal from garden to <em className="font-normal text-[#b8f15a]">measurable outcome.</em></h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#c3d4bb]">Nine chapters document the problem, the system, and the path. One live demo shows the loop running. Start wherever your garden needs attention.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/problem" className="cta-button cta-primary">Begin at chapter 01 <ArrowRight size={15} /></Link>
              <DemoCta />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
