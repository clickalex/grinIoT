// Signal Garden brand mark — a custom sprouting sensor loop, rendered crisply without external image dependencies.
export function BrandMark({ size = 40, inverted = false }: { size?: number; inverted?: boolean }) {
  const stroke = inverted ? "#173024" : "#B8F15A";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Grinrex IoT mark" role="img">
      <path d="M48.5 15.5C39.2 16.2 32.7 21.2 30.5 29.1c-1.9 6.9 1.7 13.6 8.6 16.1 6.4 2.3 13.6-.2 16.5-6.2 2.8-5.8 1-14.1-7.1-23.5Z" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30.7 30.1C17.6 31.8 10.8 39.3 10.7 50.8c7.7.8 14.5-1.2 18.2-6.9 2.8-4.4 3.5-9.5 1.8-13.8Z" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30.3 28.8v23.5" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="30.3" cy="13" r="4.2" fill={stroke} />
    </svg>
  );
}
