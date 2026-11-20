import type { ReactNode } from "react";
import {
  CircleAlert,
  CircleCheck,
  Info,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success" | "info";

const styles: Record<AlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-brand-200 bg-brand-50 text-brand-800",
};

const icons: Record<AlertVariant, LucideIcon> = {
  error: CircleAlert,
  success: CircleCheck,
  info: Info,
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const Icon = icons[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm",
        styles[variant],
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 space-y-0.5">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
