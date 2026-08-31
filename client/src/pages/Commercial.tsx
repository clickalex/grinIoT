// Grinrex IoT — Chapter 07: Commercial system.
import { ArrowRight, IndianRupee } from "lucide-react";
import { Link } from "wouter";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { commercialItems, futureModules, pricePlans, revenueStreams, subscriptionPlans } from "@/content";

export default function Commercial() {
  return (
    <PageShell
      chapterIndex={6}
      eyebrow="Commercial system"
      title={<>From balcony kit<br />to <em className="font-normal text-[#b8f15a]">urban infrastructure.</em></>}
      copy="The original specification supports a staged offering across households, growers, hospitality, education, offices, nurseries, developers, and community gardens. The key is matching product complexity to a clear installation and support model."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {commercialItems.map(([tier, target, text], index) => (
          <article className="glass-panel rounded-[1.5rem] p-6" key={tier}>
            <div className="interface text-xs font-extrabold text-[#d9a35c]">0{index + 1} / {tier}</div>
            <h3 className="mt-7 text-2xl font-bold text-[#effadf]">{target}</h3>
            <p className="mt-3 text-sm leading-6 text-[#afc5a7]">{text}</p>
          </article>
        ))}
      </div>

      <div className="mt-20 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.5rem] bg-[#e3f5be] p-7 text-[#1d3a29] sm:p-9">
          <div className="eyebrow flex items-center gap-2 text-[#547531]"><IndianRupee size={14} /> Indicative planning prices / INR</div>
          <div className="mt-7 space-y-5">
            {pricePlans.map(([tier, price, text]) => (
              <div key={tier} className="flex flex-col gap-1 border-b border-[#b9d99a]/70 pb-4 last:border-0 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <div className="font-bold">{tier}</div>
                  <p className="mt-1 max-w-md text-sm text-[#4a604c]">{text}</p>
                </div>
                <div className="display shrink-0 text-2xl">{price}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-[#4a604c]">Planning estimates only. Validate against components, manufacturing, taxes, logistics, warranty, installation, and support costs before public pricing.</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/10 bg-[#173426] p-7 sm:p-9">
          <div className="eyebrow text-[#b8f15a]">Proposed software tiers</div>
          <div className="mt-7 space-y-5">
            {subscriptionPlans.map(([tier, price, text]) => (
              <div key={tier} className="flex flex-col gap-1 border-b border-white/10 pb-4 last:border-0 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <div className="font-bold text-[#effadf]">{tier}</div>
                  <p className="mt-1 max-w-md text-sm text-[#afc5a7]">{text}</p>
                </div>
                <div className="interface shrink-0 text-sm font-extrabold text-[#b8f15a]">{price}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-[#8fae93]">Essential local automation stays hardware-owned. Subscription value is earned through history, analytics, and service.</p>
        </article>
      </div>

      <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {revenueStreams.map(([title, text], index) => (
          <article className="glass-panel rounded-[1.4rem] p-6" key={title}>
            <span className="interface text-xs font-extrabold text-[#d9a35c]">Stream 0{index + 1}</span>
            <h3 className="mt-5 text-lg font-bold text-[#effadf]">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#afc5a7]">{text}</p>
          </article>
        ))}
        <article className="rounded-[1.4rem] border border-[#d9a35c]/25 bg-[#332b1c] p-6">
          <span className="interface text-xs font-extrabold text-[#d9a35c]">Measurement</span>
          <h3 className="mt-5 text-lg font-bold text-[#f7e7c6]">What gets tracked</h3>
          <p className="mt-2 text-sm leading-6 text-[#d6c8aa]">Water saved per garden, reduced manual watering, plant condition, sensor reliability, and irrigation accuracy. Business side: sales, acquisition cost, margin, subscription conversion, retention, add-on revenue, and B2B installations.</p>
        </article>
      </div>

      <div className="mt-20">
        <div className="eyebrow text-[#b8f15a]">Future expansion surface</div>
        <div className="mt-5 flex flex-wrap gap-2">
          {futureModules.map((item) => (
            <span key={item} className="interface rounded-full border border-[#b8f15a]/20 px-3 py-1.5 text-[.6rem] font-extrabold uppercase tracking-[.07em] text-[#cbe6af]">{item}</span>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-6 rounded-[1.6rem] border border-[#b8f15a]/20 bg-[#163425] p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="eyebrow text-[#b8f15a]">The investment logic</div>
            <p className="mt-4 text-lg leading-8 text-[#e2efd8]">The commercial system is a wedge, not a catalogue: a starter product that earns the right to expand into an installed base.</p>
          </div>
          <Link href="/investor" className="cta-button cta-primary shrink-0">Read the investor chapter <ArrowRight size={15} /></Link>
        </div>
      </div>
    </PageShell>
  );
}
