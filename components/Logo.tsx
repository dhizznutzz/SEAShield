import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Logo({
  variant = "dark",
  className = "",
}: {
  /** "dark" = navy text (for light backgrounds), "light" = white text */
  variant?: "dark" | "light";
  className?: string;
}) {
  const textColor = variant === "light" ? "text-white" : "text-navy-900";
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 ${className}`}
      aria-label="SEAShield home"
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-shield-500 shadow-sm shadow-brand-500/30">
        <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.2} />
      </span>
      <span className={`text-lg font-semibold tracking-tight ${textColor}`}>
        SEA<span className="text-shield-500">Shield</span>
      </span>
    </Link>
  );
}
