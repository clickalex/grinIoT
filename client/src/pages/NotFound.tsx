// Grinrex IoT — 404. Keeps the Signal Garden frame: lost signal, not lost cause.
import { Home, SignalZero } from "lucide-react";
import { Link } from "wouter";
import { BrandMark } from "@/components/BrandMark";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function NotFound() {
  usePageMeta("Signal lost — 404 · Grinrex IoT", "This route doesn't reach the garden.");
  return (
    <div className="signal-page flex min-h-screen flex-col items-center justify-center px-5 py-20 text-center">
      <BrandMark size={64} />
      <div className="eyebrow mt-8 flex items-center gap-2 text-[#d9a35c]"><SignalZero size={14} /> Signal lost</div>
      <h1 className="display mt-4 text-7xl leading-none text-[#f4ffe5] sm:text-8xl">404</h1>
      <h2 className="display mt-4 text-3xl text-[#effadf]">This route doesn’t reach the garden.</h2>
      <p className="mt-4 max-w-md text-base leading-7 text-[#a9c1a2]">The page may have been moved, renamed, or never planted. Return to the thesis and follow the signal trail from the top.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="cta-button cta-primary"><Home size={15} /> Go home</Link>
        <Link href="/demo" className="cta-button cta-secondary">Open live demo</Link>
      </div>
    </div>
  );
}
