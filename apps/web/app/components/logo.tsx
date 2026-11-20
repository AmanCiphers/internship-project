import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  tone = "default",
  showWordmark = true,
}: {
  className?: string;
  tone?: "default" | "inverse";
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-900/20">
        <ShieldCheck aria-hidden="true" className="h-5 w-5" />
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "text-[15px] font-semibold tracking-tight",
            tone === "inverse" ? "text-white" : "text-slate-900",
          )}
        >
          Internship{" "}
          <span
            className={cn(
              tone === "inverse" ? "text-brand-300" : "text-brand-600",
            )}
          >
            Project
          </span>
        </span>
      ) : null}
    </span>
  );
}
