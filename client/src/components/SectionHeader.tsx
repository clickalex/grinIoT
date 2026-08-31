// Signal Garden section heading — editorial hierarchy paired with a compact operational chapter marker.
import type { ReactNode } from "react";

export function SectionHeader({ index, eyebrow, title, copy, light = false }: { index: string; eyebrow: string; title: ReactNode; copy?: string; light?: boolean }) {
  const muted = light ? "text-[#506853]" : "text-[#a9c1a2]";
  const heading = light ? "text-[#163024]" : "text-[#f0fbdc]";
  return (
    <div className="max-w-3xl">
      <div className={`eyebrow mb-5 flex items-center gap-3 ${light ? "text-[#5f8138]" : "text-[#b8f15a]"}`}>
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current text-[.58rem]">{index}</span>
        {eyebrow}
      </div>
      <h2 className={`display text-4xl leading-[.96] sm:text-5xl lg:text-6xl ${heading}`}>{title}</h2>
      {copy && <p className={`mt-6 max-w-2xl text-base leading-7 sm:text-lg ${muted}`}>{copy}</p>}
    </div>
  );
}
