// Grinrex IoT — Documents. One page: the complete consolidated PRD.
// Renders prd.ts with a sticky table of contents, paper reader, and Markdown export.
import { useEffect, useState } from "react";
import { ArrowDownToLine, Printer } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { prdMeta, prdSections, prdToMarkdown } from "@/prd";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Documents() {
  const [activeSection, setActiveSection] = useState(prdSections[0].id);

  // Scroll-spy: highlight the section currently in view.
  useEffect(() => {
    const updateActive = () => {
      const current = prdSections
        .map((section) => document.getElementById(section.id))
        .filter((element): element is HTMLElement => Boolean(element))
        .reduce(
          (closest, element) => {
            const distance = Math.abs(element.getBoundingClientRect().top - 140);
            return distance < closest.distance ? { id: element.id, distance } : closest;
          },
          { id: prdSections[0].id, distance: Number.POSITIVE_INFINITY }
        );
      setActiveSection(current.id);
    };
    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
    return () => window.removeEventListener("scroll", updateActive);
  }, []);

  const exportPrd = () => {
    const url = URL.createObjectURL(new Blob([prdToMarkdown()], { type: "text/markdown" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "grinrex-iot-prd.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageShell
      chapterIndex={8}
      eyebrow="Product requirements"
      title={<>One page.<br />The <em className="font-normal text-[#b8f15a]">complete</em> PRD.</>}
      copy="Vision, problem, personas, architecture, the full feature atlas, user flows, hardware, safety, security, commercial model, roadmap, metrics, and the cons & solutions audit — consolidated into a single product requirements document. Earlier per-document records are retired; this page is the source of truth."
      metaTitle="PRD — Product Requirements · Grinrex IoT"
      metaDescription="The complete one-page Grinrex IoT product requirements document: features, architecture, user flows, safety, commercial model, roadmap, and risk audit."
    >
      {/* Document header card */}
      <div className="mb-10 flex flex-col gap-6 rounded-[1.6rem] border border-white/12 bg-[#143021] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="eyebrow flex items-center gap-3 text-[#b8f15a]">
            <span>{prdMeta.docId}</span>
            <span className="document-stamp">{prdMeta.status}</span>
          </div>
          <h2 className="display mt-3 text-3xl leading-none text-[#effadf] sm:text-4xl">Grinrex IoT — Product Requirements Document</h2>
          <p className="mt-3 text-sm leading-6 text-[#a9c1a2]">
            Version {prdMeta.version} · Owner: {prdMeta.owner} · {prdMeta.tagline}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <button onClick={exportPrd} className="cta-button cta-primary"><ArrowDownToLine size={15} /> Export PRD .md</button>
          <button onClick={() => window.print()} className="cta-button cta-secondary"><Printer size={15} /> Print</button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:items-start">
        {/* Table of contents */}
        <nav className="demo-scroll lg:sticky lg:top-24" aria-label="PRD table of contents">
          <div className="eyebrow mb-3 text-[#d9a35c]">Contents · 19 sections</div>
          <ol className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {prdSections.map((section) => (
              <li key={section.id} className="shrink-0 lg:shrink">
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`demo-tab w-full !text-left ${activeSection === section.id ? "" : ""}`}
                  data-active={activeSection === section.id}
                >
                  <span className="mr-1.5 text-[#d9a35c]">{section.number}</span>
                  {section.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* The PRD document */}
        <article className="dark-document min-w-0 rounded-[1.75rem] p-6 sm:p-10 lg:p-12">
          <header className="border-b border-[#a7c48e]/60 pb-8">
            <div className="eyebrow text-[#5f8138]">Single source of truth / controlled circulation</div>
            <h2 className="display mt-3 text-4xl leading-[.98] text-[#173024] sm:text-5xl">Every drop has<br />a destination.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#506853]">
              This document replaces the earlier library records (operating brief, technical dossier, investment brief, roadmap record, risk register, full source specification, and cons &amp; solutions audit). Where earlier records disagree, this document wins.
            </p>
          </header>

          <div className="mt-10 space-y-12">
            {prdSections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-32">
                <div className="interface flex items-center gap-3 text-[.66rem] font-extrabold uppercase tracking-[.16em] text-[#5f8138]">
                  <span>{section.number}</span>
                  <span className="h-px flex-1 bg-[#a7c48e]/60" />
                </div>
                <h3 className="display mt-2 text-3xl leading-tight text-[#1f3d2b] sm:text-4xl">{section.title}</h3>

                {section.intro && <p className="mt-3 text-base font-medium leading-7 text-[#3d5a44]">{section.intro}</p>}
                {section.paragraphs?.map((paragraph, index) => (
                  <p key={index} className="mt-4 text-[.98rem] leading-7 text-[#4e6553]">{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 space-y-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-[.98rem] leading-7 text-[#4e6553]">
                        <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9ec75e]" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
                {section.table && (
                  <div className="demo-scroll mt-5 overflow-x-auto rounded-2xl border border-[#a7c48e]/50">
                    <table className="w-full min-w-[560px] border-collapse text-left">
                      <thead>
                        <tr className="bg-[#e9f3d6]">
                          {section.table.head.map((head) => (
                            <th key={head} className="interface border-b border-[#a7c48e]/50 px-4 py-2.5 text-[.58rem] font-extrabold uppercase tracking-[.12em] text-[#4a6544]">{head}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 1 ? "bg-[#f4f8ea]" : ""}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className={`border-b border-[#d5e4c0] px-4 py-3 align-top text-[.88rem] leading-6 text-[#425c49] ${cellIndex === 0 ? "font-semibold text-[#2c4635]" : ""}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {section.subs?.map((sub) => (
                  <div key={sub.heading} className="mt-6 border-l-2 border-[#9ec75e] pl-5">
                    <h4 className="text-lg font-bold text-[#1f3d2b]">{sub.heading}</h4>
                    {sub.text && <p className="mt-1.5 text-[.96rem] leading-7 text-[#4e6553]">{sub.text}</p>}
                    {sub.bullets && (
                      <ul className="mt-2 space-y-1.5">
                        {sub.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-2.5 text-[.94rem] leading-6 text-[#4e6553]">
                            <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#9ec75e]" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            ))}
          </div>

          <footer className="mt-14 border-t border-[#a7c48e]/60 pt-6 text-sm text-[#5d745f]">
            <p className="interface text-[.62rem] font-extrabold uppercase tracking-[.14em]">{prdMeta.docId} · V{prdMeta.version} · {prdMeta.status}</p>
            <p className="mt-2">Review cadence: every release gate; the risk register is refreshed monthly. “Every drop has a destination.”</p>
          </footer>
        </article>
      </div>
    </PageShell>
  );
}
