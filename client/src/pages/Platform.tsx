// Grinrex IoT — Chapter 04: Platform architecture.
import { ArrowRight, Cpu, Radio, Wrench } from "lucide-react";
import { Link } from "wouter";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { hardwareKit, operatingRules, systemLayers } from "@/content";

export default function Platform() {
  return (
    <PageShell
      chapterIndex={3}
      eyebrow="Platform architecture"
      title={<>Seven layers.<br />One <em className="font-normal text-[#d9a35c]">safe</em> data loop.</>}
      copy="The complete system architecture keeps sensing, local control, communication, records, intelligence, application visibility, and actuation distinct—so critical garden care can stay local and controllable."
    >
      <div className="grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
        <SectionHeader index="04" eyebrow="Layer model" title={<>Separation is a<br /><em className="font-normal text-[#b8f15a]">safety feature.</em></>} copy="Each layer has one responsibility and one failure boundary. A sensor fault cannot command a valve; a cloud outage cannot stop local care; an analytics failure cannot flood a garden." />
        <div className="grid gap-3 md:grid-cols-2">
          {systemLayers.map(([number, title, text]) => (
            <article className="glass-panel rounded-2xl p-5" key={title}>
              <div className="interface text-xs font-extrabold text-[#d9a35c]">{number}</div>
              <h3 className="mt-4 text-lg font-bold text-[#effadf]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#afc5a7]">{text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-20 grid gap-4 lg:grid-cols-[1fr_.9fr]">
        <article className="rounded-[1.4rem] border border-[#b8f15a]/20 bg-[#183929] p-6 sm:p-8">
          <div className="eyebrow flex items-center gap-2 text-[#b8f15a]"><Wrench size={15} /> Hardware & field kit</div>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#e4f2d9]">ESP32 control, capacitive soil sensor, BME280, BH1750, rain sensor, UV, anemometer, waterproof ultrasonic level sensor, flow meter, optional ESP32-CAM or Raspberry Pi camera, DC pump, solenoid valves, optional peristaltic pump, fan, servo, DC power, battery backup, optional solar, weatherproof enclosure, waterproof connectors, tubing, drippers, brackets, cable protection, and sensor holders.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {hardwareKit.map((item) => (
              <span key={item} className="interface rounded-full border border-[#b8f15a]/20 px-2.5 py-1 text-[.58rem] font-extrabold uppercase tracking-[.07em] text-[#cbe6af]">{item}</span>
            ))}
          </div>
        </article>
        <article className="rounded-[1.4rem] border border-[#d9a35c]/25 bg-[#332b1c] p-6 sm:p-8">
          <div className="eyebrow flex items-center gap-2 text-[#d9a35c]"><Radio size={15} /> Data and physical rules</div>
          <div className="mt-5 space-y-4">
            {operatingRules.map(([title, text]) => (
              <div key={title}>
                <h3 className="font-bold text-[#f7e7c6]">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#d6c8aa]">{text}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="mt-20 grid gap-4 sm:grid-cols-3">
        {[
          [Cpu, "Edge authority", "Thresholds, safety cutoffs, and the emergency stop run on the controller beside the garden — not behind a network hop."],
          [Radio, "Connectivity choices", "Wi-Fi and BLE first; LoRa and cellular reserved for remote and multi-site installations where they earn their cost."],
          [Wrench, "Serviceable field kit", "Replaceable sensors, weatherproof enclosures, protected connectors, drainage, and strain relief keep maintenance practical outdoors."],
        ].map(([Icon, title, text], index) => (
          <article className="glass-panel rounded-[1.4rem] p-6" key={title as string}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b8f15a]/14 text-[#b8f15a]"><Icon size={21} /></div>
            <h3 className="mt-6 text-lg font-bold text-[#effadf]"><span className="interface mr-2 text-xs font-extrabold text-[#d9a35c]">0{index + 1}</span>{title as string}</h3>
            <p className="mt-2.5 text-sm leading-6 text-[#afc5a7]">{text as string}</p>
          </article>
        ))}
      </div>

      <div className="mt-20 flex flex-col gap-6 rounded-[1.6rem] border border-[#b8f15a]/20 bg-[#163425] p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="eyebrow text-[#b8f15a]">From architecture to delivery</div>
          <p className="mt-4 text-lg leading-8 text-[#e2efd8]">The roadmap sequences this architecture so that reliability and outdoor proof arrive before intelligence and complexity.</p>
        </div>
        <Link href="/roadmap" className="cta-button cta-primary shrink-0">Read the roadmap <ArrowRight size={15} /></Link>
      </div>
    </PageShell>
  );
}
