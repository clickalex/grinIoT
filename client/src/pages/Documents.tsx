// Grinrex IoT — Chapter 09: Document library.
import { PageShell } from "@/components/PageShell";
import { DocumentLibrary } from "@/components/DocumentLibrary";

export default function Documents() {
  return (
    <PageShell
      chapterIndex={8}
      eyebrow="Document library"
      title={<>The complete narrative,<br /><em className="font-normal text-[#d9a35c]">in sequence.</em></>}
      copy="Read the operating brief, technical dossier, investor story, roadmap, risk safeguards, and the full source specification inside the presentation—or download each document for offline review."
    >
      <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-sm rounded-2xl border border-[#d9a35c]/30 bg-[#3e3420]/45 p-5">
          <div className="eyebrow text-[#d9a35c]">Reading order</div>
          <p className="mt-2 text-sm leading-6 text-[#e1d8c1]">Start with the operating brief, inspect the technical dossier, commercial case, and delivery roadmap, then use the safeguards and complete source specification as the traceable reference record.</p>
        </div>
        <div className="max-w-sm rounded-2xl border border-[#b8f15a]/25 bg-[#183929] p-5">
          <div className="eyebrow text-[#b8f15a]">Export</div>
          <p className="mt-2 text-sm leading-6 text-[#cbe3bb]">Every record exports as a Markdown file from its own tab — use the “Export record .md” button in the library header.</p>
        </div>
      </div>
      <DocumentLibrary />
    </PageShell>
  );
}
